import { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';
import './App.css';

/**
 * 투자 자산 데이터 (Mock Data)
 * id: 자산 식별자
 * name: 표시 이름
 * rate: 연간 수익률 (%)
 * type: 자산 유형 (채권/주식)
 * risk: 위험도 (낮음/중간/높음)
 */
const ASSET_DATA = [
  { id: 'sgov', name: 'SGOV (미국 초단기채)', rate: 5.2, type: 'bond', risk: 'low' },
  { id: 'schd', name: 'SCHD (미국 배당성장주)', rate: 3.5, type: 'stock', risk: 'mid' },
  { id: 'jepi', name: 'JEPI (고배당 커버드콜)', rate: 8.0, type: 'stock', risk: 'high' }
];

export default function DividendCalculator() {
  // --- 입력 상태 관리 (Input State) ---
  const [principal, setPrincipal] = useState(10000000); // 초기 투자금 (단위: 원)
  const [monthlyAddition, setMonthlyAddition] = useState(500000); // 월 적립금 (단위: 원)
  const [selectedAsset, setSelectedAsset] = useState(ASSET_DATA[0].id); // 선택된 자산 ID
  const [isReinvest, setIsReinvest] = useState(true); // 배당금 재투자 여부

  // --- 결과 상태 관리 (Result State) ---
  const [results, setResults] = useState<any[]>([]); // 시뮬레이션 결과 데이터
  const [isCalculated, setIsCalculated] = useState(false); // 계산 수행 여부

  /**
   * 시뮬레이션 실행 함수
   * '계산하기' 버튼 클릭 시 호출됨
   */
  const handleCalculate = () => {
    const asset = ASSET_DATA.find(a => a.id === selectedAsset);
    const annualRate = (asset?.rate || 0) / 100;
    const monthlyRate = annualRate / 12;

    let currentAsset = principal;
    let totalDividends = 0;
    const simulationResult = [];

    // 10년 시뮬레이션 루프
    for (let year = 1; year <= 10; year++) {
      let yearlyDividend = 0;

      // 12개월 루프
      for (let month = 1; month <= 12; month++) {
        currentAsset += monthlyAddition;
        const monthlyDividend = currentAsset * monthlyRate;
        yearlyDividend += monthlyDividend;
        totalDividends += monthlyDividend;

        if (isReinvest) {
          currentAsset += monthlyDividend;
        }
      }

      simulationResult.push({
        year: `${year}년차`,
        총자산: Math.round(currentAsset),
        누적배당금: Math.round(totalDividends),
        당해배당금: Math.round(yearlyDividend)
      });
    }

    setResults(simulationResult);
    setIsCalculated(true);
  };

  // 최종 결과 (10년차 데이터)
  const finalData = results.length > 0 ? results[results.length - 1] : null;

  /**
   * 시뮬레이션 결과를 CSV 파일로 내보내기
   */
  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = "연도,총자산(원),당해배당금(원),누적배당금(원)\n";
    const csvRows = results.map(d => `${d.year},${d.총자산},${d.당해배당금},${d.누적배당금}`);
    const blob = new Blob(["\uFEFF" + headers + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "투자_시뮬레이션_결과.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">주식 배당금 & 채권 이자 계산기</h1>
        <p className="text-gray-500 mt-2">복리 재투자 시뮬레이션 및 성향별 포트폴리오 추천</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 시뮬레이션 설정 패널 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="">
            <h2 className="text-xl font-semibold mb-6">시뮬레이션 설정</h2>

            <div className="space-y-10">
              {/* 자산 선택 드롭다운 (Asset Selection) */}
              <div className="flex flex-col space-y-2 input-group">
                <label className="text-sm font-semibold text-gray-700">투자 자산 선택</label>
                <select 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  {ASSET_DATA.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} (연 {asset.rate}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* 초기 투자금 입력 (Initial Investment) */}
              <div className="flex flex-col space-y-2 input-group">
                <label className="text-sm font-semibold text-gray-700">초기 투자금 (원)</label>
                <input 
                  type="number" 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                />
              </div>

              {/* 월 적립금 입력 (Monthly Investment) */}
              <div className="flex flex-col space-y-2 input-group">
                <label className="text-sm font-semibold text-gray-700">월 적립금 (원)</label>
                <input 
                  type="number" 
                  className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500"
                  value={monthlyAddition}
                  onChange={(e) => setMonthlyAddition(Number(e.target.value))}
                />
              </div>

              {/* 재투자 여부 선택 (Reinvestment Selection) */}
              <div className="flex flex-col space-y-2 py-4 border-y border-gray-50">
                <label className="text-sm font-semibold text-gray-700">배당금/이자 자동 재투자 여부</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors reinvestment-container" onClick={() => setIsReinvest(!isReinvest)}>
                  <input 
                    type="checkbox" 
                    id="reinvest"
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={isReinvest}
                    onChange={(e) => setIsReinvest(e.target.checked)}
                  />
                  <label htmlFor="reinvest" className="ml-3 text-sm font-medium text-gray-800 cursor-pointer">
                    {isReinvest ? "자동 재투자 활성화됨" : "자동 재투자 비활성화됨"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 계산 실행 버튼 (Enlarged & Full Width inside panel) */}
          <div className="mt-auto pt-10">
            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-6 px-8 rounded-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 text-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <TrendingUp className="w-7 h-7" />
              시뮬레이션 계산하기
            </button>
          </div>
        </div>

        {/* 오른쪽: 결과 대시보드 및 차트 섹션 */}
        <div className="lg:col-span-2 space-y-6">
          {!isCalculated ? (
            /* 계산 전 안내 메시지 */
            <div className="h-full min-h-[400px] bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-8">
              <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">설정을 완료한 후 [시뮬레이션 계산하기] 버튼을 눌러주세요.</p>
              <p className="text-sm">10년 뒤의 예상 자산 변화를 한눈에 확인할 수 있습니다.</p>
            </div>
          ) : (
            <>
              {/* 주요 지표 요약 위젯 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm">
                  <p className="text-blue-100 text-sm mb-1">10년 후 예상 총 자산</p>
                  <h3 className="text-3xl font-bold">{finalData?.총자산.toLocaleString()} 원</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm mb-1">10년 차 연간 수령 배당금</p>
                  <h3 className="text-3xl font-bold text-gray-800">{finalData?.당해배당금.toLocaleString()} 원</h3>
                  <p className="text-sm text-green-600 mt-1">월 평균 {(finalData ? finalData.당해배당금 / 12 : 0).toLocaleString()} 원</p>
                </div>
              </div>

              {/* 자산 성장 시각화 차트 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">자산 성장 추이</h2>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV 다운로드
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={results} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tickFormatter={(val) => `${(val / 10000).toFixed(0)}만`} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${(val / 10000).toFixed(0)}만`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => `${value?.toLocaleString()} 원`} />
                      <Legend />
                      <Bar yAxisId="right" dataKey="당해배당금" barSize={20} fill="#60A5FA" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="left" type="monotone" dataKey="총자산" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 추천 상품 정보 섹션 */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">투자 성향별 추천 상품</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 안정형 카드 */}
          <div className="border border-gray-200 p-4 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center mb-2 text-blue-600">
              <ShieldCheck className="w-5 h-5 mr-2" />
              <h3 className="font-bold">안정형 (단기채)</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">원금 손실을 최소화하며 달러 자산과 이자를 확보합니다.</p>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">SGOV</span>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded ml-1">TIGER 미국달러단기채</span>
          </div>

          {/* 성장형 카드 */}
          <div className="border border-gray-200 p-4 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
            <div className="flex items-center mb-2 text-green-600">
              <TrendingUp className="w-5 h-5 mr-2" />
              <h3 className="font-bold">배당성장형</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">현재 배당률은 낮지만, 장기적으로 배당금과 주가가 함께 상승합니다.</p>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">SCHD</span>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded ml-1">TIGER 미국배당다우존스</span>
          </div>

          {/* 고배당형 카드 */}
          <div className="border border-gray-200 p-4 rounded-lg hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex items-center mb-2 text-purple-600">
              <DollarSign className="w-5 h-5 mr-2" />
              <h3 className="font-bold">고배당/현금흐름형</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">당장의 현금흐름(제2의 월급) 창출에 목적을 둡니다.</p>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">JEPI</span>
            <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded ml-1">리얼티인컴(O)</span>
          </div>
        </div>
      </div>
    </div>
  );
}