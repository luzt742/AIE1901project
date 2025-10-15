import { useState } from 'react';
import { Box, Text, Container, Button, Grid } from '@chakra-ui/react';
import DataInputPanel from './components/DataInputPanel';
import BasicStatisticsTab from './components/BasicStatisticsTab';
import MLEMoMTab from './components/MLEMoMTab';
import ConfidenceIntervalTab from './components/ConfidenceIntervalTab';
import { DistributionInfo } from './types';

function App() {
  // 添加一些初始模拟数据，避免白色页面
  const getInitialData = () => {
    // 生成100个服从正态分布的随机数作为初始数据
    const data = [];
    for (let i = 0; i < 100; i++) {
      // 使用Box-Muller变换生成正态分布随机数
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(10 + 5 * z); // 均值为10，标准差为5
    }
    return data;
  };

  const [dataset, setDataset] = useState<number[] | null>(getInitialData());
  const [distribution, setDistribution] = useState<DistributionInfo | null>({
    type: 'normal',
    name: '正态分布',
    formula: 'f(x) = (1/(σ√(2π))) * e^(-(x-μ)²/(2σ²))',
    parameters: { mean: 10, std: 5 }
  });
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>('statistics');

  const handleDataChange = (newData: number[], sourceDistribution: DistributionInfo | null = null) => {
    setDataset(newData);
    setDistribution(sourceDistribution);
  };

  return (
    <Container maxW="6xl" py={8}>
      <Text fontSize="3xl" fontWeight="bold" mb={8} textAlign="center">
          全面数据分析平台
        </Text>
      
      <DataInputPanel onDataChange={handleDataChange} />
      
      {dataset && (
        <Box mt={8}>
          <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={4}>
            <Button
              onClick={() => setActiveAnalysisTab('statistics')}
              variant={activeAnalysisTab === 'statistics' ? 'solid' : 'outline'}
              colorScheme="blue"
            >
              基本统计分析
            </Button>
            <Button
              onClick={() => setActiveAnalysisTab('estimation')}
              variant={activeAnalysisTab === 'estimation' ? 'solid' : 'outline'}
              colorScheme="blue"
            >
              MLE/MoM参数估计
            </Button>
            <Button
              onClick={() => setActiveAnalysisTab('confidence')}
              variant={activeAnalysisTab === 'confidence' ? 'solid' : 'outline'}
              colorScheme="blue"
            >
              置信区间分析
            </Button>
          </Grid>
          
          {activeAnalysisTab === 'statistics' && (
            <BasicStatisticsTab dataset={dataset} />
          )}
          {activeAnalysisTab === 'estimation' && (
            <MLEMoMTab dataset={dataset} distribution={distribution} />
          )}
          {activeAnalysisTab === 'confidence' && (
            <ConfidenceIntervalTab dataset={dataset} />
          )}
        </Box>
      )}
      
      {!dataset && (
        <Box mt={8} p={8} bg="gray.50" borderRadius="md" textAlign="center">
          <Text fontSize="lg" color="gray.500">
              请通过上方的数据输入面板导入或生成数据
            </Text>
        </Box>
      )}
    </Container>
  );
}

export default App;