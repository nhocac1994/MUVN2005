import sql from 'mssql';

const config = {
  server: process.env.DB_SERVER || 'your-server-ip',
  database: process.env.DB_NAME || 'your-database-name',
  user: process.env.DB_USERNAME || 'your-username',
  password: process.env.DB_PASSWORD || 'your-password',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE || '',
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch {
    console.error('Database connection error: [Hidden for security]');
    throw new Error('Không thể kết nối đến database');
  }
}

export async function testConnection() {
  try {
    const pool = await connectToDatabase();
    await pool.request().query('SELECT 1 as test');
    await pool.close();
    return { success: true, message: 'Kết nối database thành công!' };
  } catch {
    console.error('Database test error: [Hidden for security]');
    return { success: false, message: 'Lỗi kết nối database' };
  }
}

export async function createAccount(accountData: {
  username: string;
  password: string;
  characterName: string;
  email: string;
  phone: string;
  securityQuestion: string;
  securityAnswer: string;
}) {
  try {
    const pool = await connectToDatabase();
    
    // Check if username already exists
    const checkUser = await pool.request()
      .input('username', sql.VarChar(10), accountData.username)
      .query('SELECT COUNT(*) as count FROM MEMB_INFO WHERE memb___id = @username');
    
    if (checkUser.recordset[0].count > 0) {
      await pool.close();
      return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
    }

    // Insert new account
    await pool.request()
      .input('username', sql.VarChar(10), accountData.username)
      .input('password', sql.VarChar(10), accountData.password)
      .input('characterName', sql.VarChar(10), accountData.characterName)
      .input('email', sql.VarChar(50), accountData.email)
      .input('phone', sql.VarChar(20), accountData.phone)
      .input('securityQuestion', sql.VarChar(50), accountData.securityQuestion)
      .input('securityAnswer', sql.VarChar(50), accountData.securityAnswer)
      .query(`
        INSERT INTO MEMB_INFO (
          memb___id, memb__pwd, memb_name, sno__numb, mail_addr, tel__numb,
          fpas_ques, fpas_answ, appl_days, bloc_code, ctl1_code,
          AccountLevel, AccountExpireDate
        ) VALUES (
          @username, @password, @characterName, '000000000000000000', @email, @phone,
          @securityQuestion, @securityAnswer, GETDATE(), '0', '0',
          0, '2079-06-06'
        )
      `);

    await pool.close();
    return { success: true, message: 'Tạo tài khoản thành công!' };
  } catch {
    console.error('Create account error: [Hidden for security]');
    return { success: false, message: 'Lỗi tạo tài khoản. Vui lòng thử lại sau.' };
  }
}

export async function loginAccount(username: string, password: string) {
  try {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('username', sql.VarChar(10), username)
      .input('password', sql.VarChar(10), password)
      .query('SELECT memb___id, memb_name FROM MEMB_INFO WHERE memb___id = @username AND memb__pwd = @password');
    
    await pool.close();
    
    if (result.recordset.length > 0) {
      return { 
        success: true, 
        message: 'Đăng nhập thành công!',
        user: result.recordset[0]
      };
    } else {
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' };
    }
  } catch {
    console.error('Login error: [Hidden for security]');
    return { success: false, message: 'Lỗi đăng nhập. Vui lòng thử lại sau.' };
  }
}
