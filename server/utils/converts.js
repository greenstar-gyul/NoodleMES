// 특정 서비스에 종속되지 않는 기능의 경우 별도 파일로 관리

// 데이터 타입 변환 : 객체 -> 배열
/**
 * 데이터 타입 변환 : 객체 -> 배열
 * 
 * @param {Object} target
 * 저장할 데이터 Object 객체 
 * @param {Array} selected 
 * DB에 파싱할 데이터 컬럼 순서
 * @returns 
 */
const convertObjToAry = (target, selected) => {
    // target   : 값을 들고 있는 객체
    // selected : 배열로 변환할 때 가져올 객체의 필드명들을 가짐
    let aray = [];
    for(let fieldName of selected){
        // Object['필드명'] or Object[변수]: 대괄호표기법을 활용해 변수로 필드명을 전달
        let fieldVal = target[fieldName];
        aray.push(fieldVal);
    }
    return aray;
};

module.exports = {
    convertObjToAry,
}