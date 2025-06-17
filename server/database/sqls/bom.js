// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )


// 제품등록
const insertProduct = `
 INSERT INTO prod_tbl (prod_code,
                       prod_name, 
                       prod_type,
                       unit, 
                       spec, 
                       is_used,
                       edate,
                       regdate, 
                       note,
                       com_value,
                       reg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// BOM등록
const insertBom = `
    INSERT INTO bom_tbl (bom_code,
                        unit, 
                        spec, 
                        regdate,
                        udate,
                        prod_code,
                        is_used)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 하위 자재 등록
const insertBomMat = `
    INSERT INTO bom_mat (bom_code, 
                        mat_code, 
                        mat_name, 
                        mat_type, 
                        req_qtt, 
                        unit, 
                        loss_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;


// 목록 조회
const selectBomList = `
    SELECT b.bom_code,
           p.prod_code,
           p.prod_name,
           p.edate,
           DATE_FORMAT(b.regdate, '%Y-%m-%d') AS regdate,
           comm_name(b.is_used) AS "is_used"
    FROM   bom_tbl b
    JOIN prod_tbl p ON b.prod_code = p.prod_code
    ORDER BY b.bom_code DESC
`;

// 제품 단건 조회
const prodSelectOne = `
    SELECT p.prod_code,
           p.prod_name,
           p.prod_type,
           p.unit,
           p.spec,
           p.is_used,
           p.edate,
           p.regdate,
           p.note,
           p.com_value,
           p.reg,
           b.bom_code,
           b.unit AS bom_unit,
           b.spec AS bom_spec,
           b.regdate AS bom_regdate,
           b.udate AS bom_udate,
           b.is_used AS bom_is_used
    FROM   bom_tbl b
    JOIN prod_tbl p ON b.prod_code = p.prod_code
    WHERE b.bom_code = ?`

// 자재 구성 상세 조회
const matSelectDetail = `
    SELECT bom_code,
           mat_code,
           mat_name,
           mat_type,
           req_qtt,
           unit,
           loss_rate
    FROM   bom_mat
    WHERE bom_code = ?`


// 자재 + 반제품 조회 
const selectAllMaterialsForPopup = `
  SELECT    mat_code AS code,
            mat_name AS name,
            material_type_code AS type
  FROM      mat_tbl

  UNION

  SELECT    prod_code AS code,
            prod_name AS name,
            '반제품' AS type
  FROM      prod_tbl
  WHERE     prod_type = 'i2'
`;

// 🔍 BOM 목록 검색 쿼리 개선
const searchBomList = `
  SELECT b.bom_code,
         p.prod_code,
         p.prod_name,
         p.edate,
         DATE_FORMAT(b.regdate, '%Y-%m-%d') AS regdate,
         b.is_used
  FROM bom_tbl b
  JOIN prod_tbl p ON b.prod_code = p.prod_code
  WHERE 1=1
    AND (? IS NULL OR b.bom_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR p.prod_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR p.prod_name LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR p.com_value = ?)
    AND (
         (? IS NULL OR ? IS NULL)
         OR (b.regdate BETWEEN ? AND ?)
    )
  ORDER BY b.bom_code DESC
`;

// 제품코드 자동 생성 쿼리
const selectProdCodeForUpdate = `
SELECT CONCAT(
    'PROD-',
    LPAD(IFNULL(MAX(CAST(SUBSTRING(prod_code, 6) AS UNSIGNED)), 0) + 1, 4, '0')
)
FROM prod_tbl
FOR UPDATE
`;

// 제품유형 불러오는 쿼리
const selectComValueOptions = `
SELECT DISTINCT com_value, 
                comm_name(com_value) AS com_name
FROM prod_tbl
WHERE com_value IS NOT NULL
`;


module.exports = {
    insertProduct,
    insertBom,
    insertBomMat,
    selectBomList,
    prodSelectOne,
    matSelectDetail,
    searchBomList,
    selectComValueOptions,
    selectAllMaterialsForPopup,
    selectProdCodeForUpdate,
};