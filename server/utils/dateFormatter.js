const moment = require('moment');

// 날짜를 YYYY-MM-DD HH:mm:ss 문자열로 변환
const formatDate = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// 객체의 모든 날짜 필드를 문자열로 변환
const formatDatesInObject = (obj) => {
    if (!obj) return obj;
    
    const dateFields = [
        'start_date', 'end_date', 'fail_date', 'regdate', 're_chk_exp_date',
        'chk_start_date', 'chk_end_date', 'inst_date', 'chk_exp_date'
    ];
    
    const formatted = { ...obj };
    dateFields.forEach(field => {
        if (formatted[field]) {
            formatted[field] = formatDate(formatted[field]);
        }
    });
    
    return formatted;
};

// 배열의 모든 객체 날짜 포맷팅
const formatDatesInArray = (array) => {
    if (!Array.isArray(array)) return array;
    return array.map(item => formatDatesInObject(item));
};

module.exports = {
    formatDate,
    formatDatesInObject,
    formatDatesInArray
};