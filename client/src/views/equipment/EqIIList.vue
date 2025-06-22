    <script setup>
    import axios from 'axios';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import eqiiMapping from '@/service/EquipIIMapping';
    import EqiiListTable from './components/EqiiListTable.vue';
    import EqiiListSearch from './components/EqiiListSearch.vue';

    // 데이터 및 옵션
    const eqiiData = ref([]);
    const originalData = ref([]);
    const searchRef = ref(null);

    const router = useRouter();

    // 초기 데이터 로드
    const initData = async () => {
      try {
        const result = await axios.get('/api/eq/eqiiall');
        originalData.value = result.data;
        eqiiData.value = result.data; 
        console.log('초기 데이터 로드 완료:', result.data.length, '건');
      } catch (err) {
        console.error('초기 데이터 로드 실패:', err);
      } 
    }

    // update:data 이벤트 핸들러
    const updateData = (selectedEqii) => {
      
      if (selectedEqii && selectedEqii[0].eqii_code) {
        router.push({
          name: 'eqiilist',  // 실제 라우터 이름으로 변경
          params: { eqiiCode: selectedEqii[0].eqii_code }
        });
        
      } else {
        console.warn('선택된 Eqii 데이터가 잘못되었습니다.');
      }
    };

    // moveToEqiilist 함수
    // 해당 페이지 내에서 내부 컴포넌트를 통해 조회하므로 주소에 {eqCode} 형식이 아니라, 직접 인수를 전달해야할듯?
    // 따라서 거기로 보낼 emit 작성
    const moveToEqiilist = (eqCode) => {
      console.log('이동할 eqCode:', eqCode);
      // 검색 조건 초기화
      searchRef.value.resetSearch();
      
      // eqiiData를 초기 데이터로 설정
      eqiiData.value = originalData.value.filter(item => item.eq_code === eqCode);
      
      // 검색 컴포넌트에 eqCode 전달
      searchRef.value.setEqCode(eqCode);
    };

    const handleSearch = async (searchParams) => {
        try {
            console.log('🔍 검색 조건:', searchParams);
            
            // 검색 API 호출
            const params = new URLSearchParams();
            
            // null이나 빈 값이 아닌 경우만 파라미터에 추가
            if (searchParams.eqii_code) params.append('eqii_code', searchParams.eqii_code);
            if (searchParams.stat) params.append('stat', searchParams.stat);
            if (searchParams.inst_emp_name) params.append('inst_emp_name', searchParams.inst_emp_name);
            if (searchParams.start_date) params.append('start_date', searchParams.start_date);
            if (searchParams.end_date) params.append('end_date', searchParams.end_date);
            
            const response = await axios.get(`/api/eq/eqii/search?${params}`);
            
            if (response.data.success) {
                eqiiData.value = response.data.data;
            } else {
                console.error('검색 실패:', response.data.error);
                eqiiData.value = [];
            }
        } catch (error) {
            console.error('🚨 검색 오류:', error);
            eqiiData.value = [];
        }
    };

    // 검색 조건 초기화
    const resetSearch = () => {
      eqiiData.value = [...originalData.value];
    };

    onMounted(() => {
      initData();
    })

    </script>

    <template>
      <EqiiListSearch 
        @search="handleSearch" 
        @resetSearch="resetSearch"  
        ref="searchRef" 
      />
      
      <EqiiListTable  
        :eqiidata="eqiiData" 
        :mapper="eqiiMapping" 
        @initData="initData" 
        @update:data="updateData"
      />
    
      <!-- 조건 미일치 메시지 -->
      <div v-if="eqiiData.length === 0" class="text-center text-gray-500 mt-4">
        조건에 맞는 데이터가 없습니다.
      </div>
    </template>