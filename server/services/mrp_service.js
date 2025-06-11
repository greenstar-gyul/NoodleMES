const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require('../utils/converts.js');

/**
 * 조건 없이 mrp 전체조회
 * @returns 전체 MRP 리스트
 */
const findAll = async () => {
  const list = await mariadb.query("selectMRPList")
    .catch(err => console.log(err));
  return list;
};

/**
 * 조건 없이 mrp 상세 전체조회
 * @returns MRP 상세 전체 리스트
 */
const findDetailsAll = async () => {
  const list = await mariadb.query("selectMRPDetailList")
    .catch(err => console.log(err));
  return list;
};

/**
 * 생산 계획 전체 조회
 * @returns 생산 계획 리스트
 */
const findPlansAll = async () => {
  const list = await mariadb.query("selectPRDPList")
    .catch(err => console.log(err));
  return list;
};

/** 
 * 특정 생산 계획의 mrp 코드 조회
 *  @returns 특정 생산 계획의 mrp 코드
 * */
const findMRPCode = async (prdpCode) => {
  const list = await mariadb.query("selectMRPCode", prdpCode)
    .catch(err => console.log(err));
  return list;
};

/** 
 * 특정 mrp 코드의 mrp 조회
 *  @returns 특정 mrp 코드의 mrp
 * */
const findMRP = async (mrpCode) => {
  const mrp = await mariadb.query("selectMRP", mrpCode)
    .catch(err => console.log(err));
  return mrp;
};

/** 
 * 특정 mrp 코드의 mrp 상세 조회
 *  @returns 특정 mrp 코드의 mrp 상세
 * */
const findMRPDetail = async (mrpCode) => {
  const list = await mariadb.query("selectMRPDetail", mrpCode)
    .catch(err => console.log(err));
  return list;
};

module.exports = {
  findAll,
  findDetailsAll,
  findPlansAll,
  findMRPCode,
  findMRPDetail,
};