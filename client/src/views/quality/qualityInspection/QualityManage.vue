<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import QualityManageSearch from './QualityManageSearch.vue';
import QualityManageMiddleTbl from './QualityManageMiddleTbl.vue';
import QualityManageBottomTbl from './QualityManageBottomTbl.vue';
import axios from 'axios';
import moment from 'moment';
import QualityManageInputForm from './QualityManageInputForm.vue';

const currentQioCode = ref('');
const lastProcessedQioCode = ref('');
const route = useRoute();
const selectedQir = ref(null);
const bottomTblRef = ref(null)

const qioInfo = ref({
    qio_code: '',
    qio_date: null,
    insp_date: null,
    prdr_code: '',
    po_code: '',
    mpr_d_code: '',
    emp_name: '정품질'
});
const qirList = ref([]);
const mprList = ref({
    mpr_code: '',
    mpr_d_code: '',
    mat_name: '',
    mat_code: '',
    deadline: null,
    req_qtt: '0'
});
const qioList = ref([]);
const prdrList = ref({
    prdr_code: '',
    po_name: '',
    prod_name: '',
    end_date: null,
    production_qtt: '0'
});

const combinedMiddleData = computed(() => {
    return {
        // 기본 정보
        qio_code: qioInfo.value.qio_code || '',

        // PRDR 필드들
        prdr_code: prdrList.value.prdr_code || '',
        po_name: prdrList.value.po_name || null,
        prod_name: prdrList.value.prod_name || '',
        end_date: prdrList.value.end_date || null,
        production_qtt: prdrList.value.production_qtt || '0',

        // MPR 필드들
        mpr_code: mprList.value.mpr_code || '',
        mpr_d_code: mprList.value.mpr_d_code || '',
        mat_name: mprList.value.mat_name || '',
        mat_code: mprList.value.mat_code || '',
        deadline: mprList.value.deadline || null,
        req_qtt: mprList.value.req_qtt || '0'
    };
});

// 라우트 파라미터에서 qio_code 가져오기
const getqioCodeFromRoute = () => {
    const qioCodeParam = route.params.qioCode;
    console.log('라우트에서 가져온 qio_code:', qioCodeParam);
    return qioCodeParam || '';
};

// ✅ QIO 코드 변경 시 데이터 로딩 (watch 대신 직접 호출)
const handleQioCodeChange = async (newCode) => {
    console.log('QIO 코드 변경 처리:', newCode);

    if (!newCode || newCode === lastProcessedQioCode.value) {
        console.log('중복 처리 방지:', newCode);
        return;
    }

    lastProcessedQioCode.value = newCode;
    console.log('데이터 로딩 시작:', newCode);

    // 병렬 처리
    try {
        await loadQioInfo(newCode);
        await loadPrdrInfoByQioCode(newCode);
        await loadMprInfoByQioCode(newCode);
        await loadQirInfoByQioCode(newCode);
    } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
    }

    selectedQir.value = {
        qio_code: newCode,
        qir_code: '',
        po_name: prdrList.value.po_name || '',
        prod_name: prdrList.value.prod_name || '',
        inspection_item: '',
        qcr_code: '',
        result: '',
        qir_emp_name: '',
        start_date: null,
        end_date: null,
        unpass_qtt: '',
        pass_qtt: '',
        unpass_rate: '',
        note: ''
    };

    console.log('🎯 InputForm에 QIO 기본 데이터 전달:', selectedQir.value);
};

// ✅ 특정 QIO 코드로 데이터 로딩
const loadQioDataByCode = async (qioCodeParam) => {
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qlt/qio/${qioCodeParam}`);

        if (response.data && response.data.data) {
            qioInfo.value = {
                ...response.data.data,
                qio_date: response.data.data.qio_date ? new Date(response.data.data.qio_date) : null,
                insp_date: response.data.data.insp_date ? new Date(response.data.data.insp_date) : null
            };

            // 단순 할당만
            const qioCode = qioInfo.value.qio_code;
            currentQioCode.value = qioCode;

            // 데이터 로딩은 별도 호출
            await handleQioCodeChange(qioCode);

            console.log('로딩된 qio_code:', qioCode);
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

// ✅ 컴포넌트 마운트 시 초기화
onMounted(async () => {
    const qioCodeFromRoute = getqioCodeFromRoute();

    if (qioCodeFromRoute) {
        await loadQioDataByCode(qioCodeFromRoute);
    } else {
        // 빈페이지일 때 QIR 전체 조회
        await loadSimpleQirList();
    }
});

// 날짜 포맷팅 함수들
const formatDateForDB = (date) => {
    if (!date) return null;

    let dateObj;
    if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        return null;
    }

    if (isNaN(dateObj.getTime())) {
        console.warn('잘못된 날짜 형식:', date);
        return null;
    }

    // 날짜만! YYYY-MM-DD 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// 데이터 유효성 검증
const validateData = () => {

};

// ✅ 데이터 저장
const saveData = async () => {
    const isNewQio = !qioInfo.value.qio_code || qioInfo.value.qio_code === '';
    try {
        console.log('💾 저장 시작...');

        // 📝 데이터 유효성 검증
        if (!qioInfo.value.qio_date) {
            alert('지시일자를 입력해줘! ㅠㅠ');
            return;
        }

        if (!qioInfo.value.insp_date) {
            alert('검사예정일을 입력해줘! 😅');
            return;
        }

        if (!qioInfo.value.emp_name) {
            alert('지시자를 입력해줘! 🤔');
            return;
        }

        // 🎯 QIR 데이터 포맷팅 처리
        const formattedQirList = qioList.value.map(qir => {
            console.log('🔄 QIR 포맷팅 중:', qir.qir_code);
            console.log('- 원본 start_date:', qir.start_date);
            console.log('- 원본 end_date:', qir.end_date);

            console.log('🔍 원본 QIR 데이터 전체:', qir);
            console.log('🔍 원본 inspection_item:', qir.inspection_item);
            console.log('🔍 원본 qcr_code:', qir.qcr_code);

            const formattedQir = {
                ...qir,
                // 🎯 날짜+시간 포맷팅 (start_date, end_date)
                start_date: formatDateTimeForDB(qir.start_date),
                end_date: formatDateTimeForDB(qir.end_date),
                // 숫자 필드들도 안전하게 변환
                unpass_qtt: parseInt(qir.unpass_qtt) || 0,
                pass_qtt: parseInt(qir.pass_qtt) || 0,
                unpass_rate: parseFloat(qir.unpass_rate) || 0,
                qir_emp_name: qir.qir_emp_name || qioInfo.value.emp_name || '정품질',
                inspection_item: qir.inspection_item || '',
                qcr_code: qir.qcr_code || '',
            };

            console.log('✅ 포맷팅 완료:');
            console.log('- 변환된 start_date:', formattedQir.start_date);
            console.log('- 변환된 end_date:', formattedQir.end_date);

            return formattedQir;
        });

        // 🔄 저장 API 호출
        const savePayload = {
            qioData: {
                qio_code: qioInfo.value.qio_code || '',
                // 🎯 QIO는 날짜만 (기존 함수 사용)
                qio_date: formatDateForDB(qioInfo.value.qio_date),
                insp_date: formatDateForDB(qioInfo.value.insp_date),
                prdr_code: prdrList.value.prdr_code || null,
                po_name: prdrList.value.po_name || '',
                mpr_d_code: mprList.value.mpr_d_code || null,
                emp_name: qioInfo.value.emp_name || '정품질'
            },
            detailData: isNewQio ? [] : formattedQirList  // 🎯 포맷팅된 QIR 데이터!
        };

        console.log('📤 최종 저장 데이터:', savePayload);

        const response = await axios.post('/api/qlt/qio/save-all', savePayload);

        if (response.data.success) {
            alert('저장이 완료되었어! 🎉');

            const newQioCode = response.data.data.qio_code;
            if (newQioCode) {
                await forcedDataReload(newQioCode);
            }
        } else {
            alert('저장에 실패했어 ㅠㅠ');
        }
    } catch (error) {
        console.error('💥 저장 실패:', error);
        alert('저장 중 오류가 발생했어! 😭\n' + (error.response?.data?.message || error.message));
    }
};

const formatDateTimeForDB = (date) => {
    if (!date) return null;

    let dateObj;
    if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        return null;
    }

    if (isNaN(dateObj.getTime())) {
        console.warn('잘못된 날짜 형식:', date);
        return null;
    }

    // 🎯 날짜+시간! YYYY-MM-DD HH:mm:ss 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const forcedDataReload = async (qioCode) => {
    try {
        console.log('🔄 강제 데이터 새로고침 시작:', qioCode);

        // 1️⃣ QIO 정보 다시 로드
        const qioResponse = await axios.get(`/api/qlt/qio/${qioCode}`);
        if (qioResponse.data && qioResponse.data.data) {
            const freshQioData = qioResponse.data.data;

            // 직접 qioInfo 업데이트 (watch 트리거)
            qioInfo.value = {
                qio_code: freshQioData.qio_code,
                qio_date: freshQioData.qio_date ? new Date(freshQioData.qio_date) : null,
                insp_date: freshQioData.insp_date ? new Date(freshQioData.insp_date) : null,
                prdr_code: freshQioData.prdr_code || '',
                mpr_d_code: freshQioData.mpr_code || '',
                emp_name: freshQioData.emp_name || '정품질'
            };

            console.log('✅ QIO 정보 새로고침 완료');
        }

        // 2️⃣ QIR 목록 다시 로드 (DB에서)
        await loadQirInfoByQioCode(qioCode);

        // 3️⃣ 생산실적 정보 다시 로드
        await loadPrdrInfoByQioCode(qioCode);

        await loadMprInfoByQioCode(qioCode);

        // 4️⃣ currentQioCode 업데이트
        currentQioCode.value = qioCode;
        lastProcessedQioCode.value = qioCode;

        console.log('🎉 모든 데이터 새로고침 완료!');

    } catch (error) {
        console.error('❌ 데이터 새로고침 실패:', error);
    }
};

// ✅ 데이터 초기화
const resetData = () => {
    qioList.value = [];
    qioInfo.value = {
        qio_code: '',
        qio_date: null,
        insp_date: null,
        prdr_code: '',
        mpr_d_code: '',
        emp_name: '정품질'
    };
    prdrList.value = {
        prdr_code: '',
        po_name: '',
        prod_name: '',
        end_date: null,
        production_qtt: '0',
    };
    mprList.value = {
        mpr_code: '',
        mpr_d_code: '',
        mat_name: '',
        mat_code: '',
        deadline: null,
        req_qtt: '0'
    };
    currentQioCode.value = '';
    lastProcessedQioCode.value = '';
    loadSimpleQirList();

    if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
        bottomTblRef.value.clearSelection();
    }
    selectedQir.value = null;
};

// ✅ QIO 목록 로딩 (실제로는 QIR 목록을 qioList에 로딩)
const loadQioInfo = async (qioCodeParam) => {
    if (qioCodeParam && qioCodeParam !== '') {
        try {
            // QIR 목록을 qioList에 로딩
            await loadQirInfoByQioCode(qioCodeParam);
        } catch (error) {
            console.error('QIO 목록 로딩 실패:', error);
            qioList.value = [];
        }
    } else {
        qioList.value = [];
    }
};

// ✅ 생산실적 정보 로딩
const loadPrdrInfoByQioCode = async (qioCodeParam) => {
    console.log('검사지시에 연결된 생산실적 자동 로딩:', qioCodeParam);

    try {
        const response = await axios.get(`/api/qlt/qio/prdr/${qioCodeParam}`);
        console.log('생산실적 API 응답:', response.data);

        if (response.data.data && response.data.data.length > 0) {
            const data = response.data.data[0];
            prdrList.value = {
                qio_code: data.qio_code || '',
                prdr_code: data.prdr_code || '',
                po_name: data.po_name || '',
                prod_name: data.prod_name || '',
                end_date: data.end_date,
                production_qtt: String(data.production_qtt || 0)
            };

            console.log('생산실적 정보 자동 로딩 완료:', prdrList.value);
        } else {
            // 데이터가 없을 때 QIO 정보에서 가져오기
            prdrList.value = {
                qio_code: qioCodeParam,
                prdr_code: qioInfo.value.prdr_code || '',
                po_name: '',
                prod_name: '',
                end_date: null,
                production_qtt: '0'
            };
        }
    } catch (error) {
        console.error('생산실적 자동 로딩 실패:', error);
        prdrList.value = {
            qio_code: qioCodeParam,
            prdr_code: qioInfo.value.prdr_code || '',
            po_name: '',
            prod_name: '',
            end_date: null,
            production_qtt: '0'
        };
    }
};

const loadMprInfoByQioCode = async (qioCodeParam) => {
    console.log('검사지시에 연결된 자재정보 자동 로딩:', qioCodeParam);

    try {
        const response = await axios.get(`/api/qlt/qio/mpr/${qioCodeParam}`);
        console.log('자재정보 API 응답:', response.data);

        if (response.data.data && response.data.data.length > 0) {
            const data = response.data.data[0];
            mprList.value = {
                mpr_code: data.mpr_code || '',
                mpr_d_code: data.mpr_d_code || '',
                mat_name: data.mat_name || '',
                mat_code: data.mat_code || '',
                deadline: data.deadline,
                req_qtt: String(data.req_qtt || 0)
            };

            console.log('자재정보 자동 로딩 완료:', mprList.value);
        } else {
            // 데이터가 없을 때 초기화
            mprList.value = {
                mpr_code: '',
                mpr_d_code: '',
                mat_name: '',
                mat_code: '',
                deadline: null,
                req_qtt: '0'
            };
        }
    } catch (error) {
        console.error('자재정보 자동 로딩 실패:', error);
        mprList.value = {
            mpr_code: '',
            mpr_d_code: '',
            mat_name: '',
            mat_code: '',
            deadline: null,
            req_qtt: '0'
        };
    }
};

const loadQirInfoByQioCode = async (qioCodeParam) => {
    console.log('QIR 목록 로딩 시작:', qioCodeParam);
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qlt/qir/simple/${qioCodeParam}`);

        if (response.data && response.data.success) {
            qirList.value = response.data.data || [];
            // QIR 목록을 qioList에도 복사 (BottomTbl 표시용)
            qioList.value = [...qirList.value];
        } else {
            qirList.value = [];
            qioList.value = [];
        }

        console.log('QIR 목록 로딩 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 로딩 실패:', error);
        qirList.value = [];
        qioList.value = [];
    }
};

// 🎯 새로운 메모리 관리 함수들
const addQirToMemory = (newQirData) => {
    console.log('📥 메모리에 QIR 추가:', newQirData);

    // qioList에 추가 (이게 BottomTbl에 표시됨)
    qioList.value.push(newQirData);

    console.log('✅ 메모리 추가 완료, 현재 목록:', qioList.value.length, '건');

    // BottomTbl 선택 해제
    if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
        bottomTblRef.value.clearSelection();
    }
};

const updateQirInMemory = (updatedQirData) => {
    console.log('📝 메모리에서 QIR 수정:', updatedQirData);

    // qioList에서 해당 QIR 찾아서 수정
    const index = qioList.value.findIndex(item => item.qir_code === updatedQirData.qir_code);

    if (index !== -1) {
        qioList.value[index] = { ...updatedQirData };
        console.log('✅ 메모리 수정 완료');

        // BottomTbl 선택 해제
        if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
            bottomTblRef.value.clearSelection();
        }
    } else {
        console.warn('❌ 수정할 QIR을 찾을 수 없음');
    }
};

// QIR 삭제
const deleteSelectedQir = (selectedItems) => {
    console.log('QIR 삭제 요청:', selectedItems);

    if (!selectedItems || selectedItems.length === 0) {
        alert('삭제할 QIR을 선택해주세요! 🤔');
        return;
    }

    if (!confirm(`정말로 ${selectedItems.length}개의 QIR을 삭제하시겠습니까?`)) {
        return;
    }

    // ✅ 진짜 삭제 처리!
    selectedItems.forEach(selectedItem => {
        const index = qioList.value.findIndex(qir => qir.qir_code === selectedItem.qir_code);
        if (index !== -1) {
            console.log('🗑️ 메모리에서 QIR 삭제:', qioList.value[index].qir_code);
            qioList.value.splice(index, 1);
        }
    });

    // 선택 해제
    if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
        bottomTblRef.value.clearSelection();
    }

    alert(`${selectedItems.length}개의 QIR이 삭제 예정 목록에 추가되었어! 저장하면 완전히 삭제돼! 🎉`);
};

// QIR 엑셀 다운로드
const exportQirToExcel = (data) => {
    console.log('QIR 엑셀 다운로드:', data);
    alert('엑셀 다운로드 기능은 아직 구현 중입니다.');
};

const loadSimpleQirList = async () => {
    console.log('QIR 목록 간단 조회 시작');

    try {
        const response = await axios.get('/api/qlt/qir/simple');

        if (response.data && response.data.success) {
            qirList.value = response.data.data || [];
            qioList.value = [...qirList.value];  // 복사
        } else {
            qirList.value = [];
            qioList.value = [];
        }

        console.log('QIR 목록 간단 조회 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 간단 조회 실패:', error);
        qirList.value = [];
        qioList.value = [];
    }
};

const loadQirListByQioCode = async (qioCodeParam) => {
    console.log('QIR 목록 로딩 시작:', qioCodeParam);

    if (!qioCodeParam) {
        console.warn('QIO 코드가 제공되지 않았습니다.');
        return;
    }

    try {
        await loadQirInfoByQioCode(qioCodeParam);
        console.log('QIR 목록 로딩 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 로딩 실패:', error);
        qirList.value = [];
        qioList.value = [];
    }
};

// QIR 선택 변경
const onSelectionChange = async (selectedItems) => {
    console.log('선택된 QIR:', selectedItems);

    if (selectedItems && selectedItems.length === 1) {
        const selectedItem = selectedItems[0];

        // 🎯 선택된 QIR의 상세 정보 로딩 (수정 모드)
        if (selectedItem.qir_code && !selectedItem.qir_code.startsWith('QIR-TEMP-')) {
            // DB에서 상세 정보 로딩
            try {
                console.log('QIR 상세 정보 로딩 시작:', selectedItem.qir_code);

                const response = await axios.get(`/api/qlt/qir/${selectedItem.qir_code}`);

                if (response.data && response.data.success) {
                    selectedQir.value = response.data.data;
                    console.log('InputForm으로 전달할 QIR 상세 데이터 (수정 모드):', selectedQir.value);
                } else {
                    selectedQir.value = selectedItem;
                    console.warn('QIR 상세 정보 로딩 실패, 기본 데이터 사용');
                }
            } catch (error) {
                console.error('QIR 상세 정보 로딩 오류:', error);
                selectedQir.value = selectedItem;
            }
        } else {
            // 임시 데이터는 그대로 전달
            selectedQir.value = selectedItem;
        }
    } else {
        // 🔄 선택 해제 시 - QIO 코드가 있으면 기본 모드로 유지!
        if (currentQioCode.value) {
            selectedQir.value = {
                qio_code: currentQioCode.value,
                qir_code: '', // 새 등록 모드
                po_name: prdrList.value.po_name || '',
                prod_name: prdrList.value.prod_name || '',
                // 추가 필드들
                inspection_item: '',
                qcr_code: '',
                result: '',
                qir_emp_name: '',
                start_date: null,
                end_date: null,
                unpass_qtt: '',
                pass_qtt: '',
                unpass_rate: '',
                note: ''

            };
            console.log('🎯 QIR 선택 해제, QIO 기본 모드 유지:', selectedQir.value);
        } else {
            // QIO 코드가 없으면 완전히 초기화
            selectedQir.value = null;
            console.log('🚫 QIO 코드 없음, 완전 초기화');
        }
    }
};

// 데이터 업데이트 후 처리 (더 이상 사용 안함)
const onDataUpdated = async () => {
    console.log('QIR 데이터 업데이트됨 - 선택 해제');

    // 단순히 선택 해제만
    if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
        bottomTblRef.value.clearSelection();
    }

    // QIO 기본 모드로 복귀
    if (currentQioCode.value) {
        selectedQir.value = {
            qio_code: currentQioCode.value,
            qir_code: '', // 새 등록 모드
            po_name: prdrList.value.po_name || '',
            prod_name: prdrList.value.prod_name || '',
            inspection_item: '',
            qcr_code: '',
            result: '',
            qir_emp_name: '',
            start_date: null,
            end_date: null,
            unpass_qtt: '',
            pass_qtt: '',
            unpass_rate: '',
            note: ''
        };
    } else {
        selectedQir.value = null;
    }
};

// ✅ qioInfo 업데이트 함수 (무한루프 방지)
const updateqioInfo = async (newData) => {
    console.log('qioInfo 업데이트:', newData);

    // 현재 코드 저장
    const oldCode = qioInfo.value.qio_code;
    const newCode = newData.qio_code;

    // 데이터 업데이트
    qioInfo.value = { ...qioInfo.value, ...newData };

    // 코드가 변경된 경우에만 처리
    if (newCode && newCode !== oldCode && newCode !== currentQioCode.value) {
        console.log('새로운 QIO 코드 설정:', newCode);
        currentQioCode.value = newCode;

        // 데이터 로딩
        await handleQioCodeChange(newCode);
    }
};

// prdrList 업데이트
const updatePrdrOrMprList = (newData) => {
    if (newData.prdr_code) {
        // PRDR 선택 시: PRDR 업데이트, MPR 초기화
        prdrList.value = newData;
        mprList.value = {
            mpr_code: '',
            mpr_d_code: '',
            mat_name: '',
            mat_code: '',
            deadline: null,
            req_qtt: '0'
        };
        console.log('prdrList 업데이트 완료:', prdrList.value);
    } else if (newData.mpr_code) {
        // MPR 선택 시: MPR 업데이트, PRDR 초기화  
        mprList.value = newData;
        prdrList.value = {
            prdr_code: '',
            po_name: '',
            mpr_code: '',
            prod_name: '',
            end_date: null,
            production_qtt: '0'
        };
        console.log('mprList 업데이트 완료:', mprList.value);
    }
};

// qioList 업데이트
const updateqioList = async (newList) => {
    console.log('qioList 업데이트:', newList);
    if (currentQioCode.value) {
        await loadQioInfo(currentQioCode.value);
    }
};

</script>

<template>
    <div>
        <div class="flex flex-col lg:flex-row gap-6 mt-4">
            <QualityManageSearch :data="qioInfo" @loadPrdrByQio="loadPrdrInfoByQioCode"
                @loadQirByQio="loadQirListByQioCode" @update:data="updateqioInfo" @reset-list="resetData"
                @save-data="saveData">
            </QualityManageSearch>
            <QualityManageMiddleTbl :data="combinedMiddleData" @update:data="updatePrdrOrMprList"
                @reset-list="resetData" @save-data="saveData">
            </QualityManageMiddleTbl>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 mt-6">
            <div class="space-y-6" style="width: 43%">
                <QualityManageBottomTbl ref="bottomTblRef" :data="qioList" :dataKey="'qir_code'" :title="'품질검사결과 목록'"
                    :columns="[
                        'qir_code',
                        'po_name',
                        'result',
                        'qio_date',
                    ]" :mapper="{
                        qir_code: '검사코드',
                        po_name: '발주명',
                        result: '검사결과',
                        qio_date: '지시일자'
                    }" @selection-change="onSelectionChange" @delete="deleteSelectedQir" @export="exportQirToExcel" />
            </div>
            <QualityManageInputForm :selectedData="selectedQir" @data-updated="onDataUpdated"
                @add-to-memory="addQirToMemory" @update-in-memory="updateQirInMemory" />
        </div>
    </div>
</template>