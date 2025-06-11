const mariadb = require('mariadb');
const sqlList = require('./sqlList.js');


const connectionPool = mariadb.createPool({
  // DB에 접속하는 정보
  host : process.env.DB_HOST,
  port : process.env.DB_PORT,
  user : process.env.DB_USER,
  password : process.env.DB_PWD,
  database : process.env.DB_DB,
  connectionLimit : process.env.DB_LIMIT,

  permitSetMultiParamEntries:true,
  insertIdAsNumber:true,
  bigIntAsNumber:true,
  multipleStatements: true,
  logger:{
    query : console.log,
    error : console.log,
  }
});

const query = async (alias, values)=>{  
  let executeSql = sqlList[alias];
  let conn;
  try{
    conn = await connectionPool.getConnection();    
    let res = await conn.query(executeSql, values);
    return res;
  }catch(err){
    throw err;
  }finally{
    if(conn) conn.release();
  }
};


const queryDirect = async (sql, values = []) => {
  let conn;
  try {
    conn = await connectionPool.getConnection();
    let res = await conn.query(sql, values);
    return res;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


const runTransaction = async (queries) =>{  
  for (const {alias, values} of queries) {
    let executeSql = sqlList[alias];
    let conn;
    try{
      conn = await connectionPool.getConnection();    
      let res = await conn.query(executeSql, values);

      res;
    }catch(err){
      throw err;
    }finally{
      if(conn) conn.release();
    }
  }
};

module.exports = {
  query,
  queryDirect,
  runTransaction
}