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
const addResultCode = (res, successful, message, data = null, ) => {
  const result = {
    result_code: successful ? 'SUCCESS' : 'FAIL',
    message,
  };

  if (successful) result.data = data;
  else result.error = error;

  res.send(result);
};

module.exports = {
  addResultCode,
}