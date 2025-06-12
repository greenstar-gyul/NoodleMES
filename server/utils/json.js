/**
 * 결과 코드 추가하기
 * 
 * @param res
 * Object: response 객체
 * @param successful
 * Boolean: 성공 여부, true: 성공 false: 실패
 * @param message
 * String: 성공/실패 메시지
 */
const addResultCode = (res, successful, message) => {
    if (successful)
      res.result_code = 'SUCCESS';
    else
      res.result_code = 'FAILURE';

    res.message = message;
};

module.exports = {
  addResultCode,
}