import { useState, useEffect } from 'react';
import { Box, Text, Card, CardBody, Grid, Select, FormLabel, Tabs, TabList, Tab, TabPanels, TabPanel, Switch, SwitchProps } from '@chakra-ui/react';
import { calculateMeanConfidenceInterval, calculateProportionConfidenceInterval } from '../utils/statistics';
import { ConfidenceIntervalTabProps } from '../types';

function ConfidenceIntervalTab({ dataset }: ConfidenceIntervalTabProps) {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [confidenceInterval, setConfidenceInterval] = useState<{ 
    lower: number; 
    upper: number; 
    marginOfError: number; 
    method: string;
    criticalValue: number;
    standardError: number;
    sampleSize: number;
    isLargeSample: boolean;
  } | null>(null);
  const [proportionInterval, setProportionInterval] = useState<{ lower: number; upper: number; marginOfError: number } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('0');
  const [successes, setSuccesses] = useState<number>(50);
  const [trials, setTrials] = useState<number>(100);
  const [populationVarianceKnown, setPopulationVarianceKnown] = useState<boolean>(false);
  const [assumedPopulationVariance, setAssumedPopulationVariance] = useState<number>(1);

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      calculateMeanCI();
      calculateProportionCI();
    }
  }, [dataset, confidenceLevel, successes, trials, populationVarianceKnown, assumedPopulationVariance]);

  const calculateMeanCI = () => {
    try {
      const result = calculateMeanConfidenceInterval(
        dataset, 
        confidenceLevel, 
        populationVarianceKnown, 
        populationVarianceKnown ? assumedPopulationVariance : undefined
      );
      setConfidenceInterval(result);
    } catch (error) {
      console.error('计算均值置信区间失败:', error);
    }
  };

  // 处理总体方差输入变化
  const handlePopulationVarianceChange = (value: number) => {
    // 确保总体方差为正数
    setAssumedPopulationVariance(Math.max(0.0001, value));
  };

  const calculateProportionCI = () => {
    try {
      // 使用用户设置的成功次数和试验次数进行比例置信区间计算
      const result = calculateProportionConfidenceInterval(successes, trials, confidenceLevel);
      setProportionInterval(result);
    } catch (error) {
      console.error('计算比例置信区间失败:', error);
    }
  };

  // 处理成功次数变化
  const handleSuccessesChange = (value: number) => {
    // 确保成功次数不小于0，不大于试验次数
    const newSuccesses = Math.min(Math.max(0, value), trials);
    setSuccesses(newSuccesses);
  };

  // 处理试验次数变化
  const handleTrialsChange = (value: number) => {
    // 确保试验次数不小于1，不小于成功次数
    const newTrials = Math.max(1, value);
    setTrials(newTrials);
    // 如果成功次数大于新的试验次数，调整成功次数
    if (successes > newTrials) {
      setSuccesses(newTrials);
    }
  };

  // 置信水平选项
  const confidenceOptions = [
    { value: 0.90, label: '90%' },
    { value: 0.95, label: '95%' },
    { value: 0.99, label: '99%' }
  ];

  // 计算样本统计量用于显示
  const sampleMean = dataset.length > 0 ? dataset.reduce((sum, val) => sum + val, 0) / dataset.length : 0;
  const sampleStd = dataset.length > 0 ? Math.sqrt(dataset.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) / dataset.length) : 0;
  const sampleSize = dataset.length;

  return (
    <Box p={6}>
      <Text fontSize="xl" fontWeight="bold" mb={6}>置信区间分析</Text>
      
      <Tabs index={parseInt(activeTab)} onChange={(index) => setActiveTab(index.toString())} mb={6}>
        <TabList>
          <Tab>均值的置信区间</Tab>
          <Tab>比例的置信区间</Tab>
        </TabList>
        <TabPanels>
          {/* 均值置信区间面板 */}
          <TabPanel>
            <Grid gridTemplateColumns="1fr 2fr" gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="bold" mb={4}>参数设置</Text>
                  <FormLabel>置信水平</FormLabel>
                  <Select 
                    value={confidenceLevel.toString()} 
                    onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                    mb={4}
                  >
                    {confidenceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <Switch 
                      isChecked={populationVarianceKnown}
                      onChange={(e) => setPopulationVarianceKnown(e.target.checked)}
                      id="population-variance-known"
                    />
                    <FormLabel htmlFor="population-variance-known" style={{ marginLeft: '8px', marginBottom: '0' }}>
                      已知总体方差
                    </FormLabel>
                  </div>
                  
                  {populationVarianceKnown && (
                    <>
                      <FormLabel>总体方差</FormLabel>
                      <input
                        type="number"
                        value={assumedPopulationVariance}
                        onChange={(e) => handlePopulationVarianceChange(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          marginBottom: '12px'
                        }}
                        min="0.0001"
                        step="0.0001"
                      />
                    </>
                  )}
                </CardBody>
              </Card>

              {confidenceInterval && (
                <Card>
                  <CardBody>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>均值的置信区间结果</Text>
                    <Grid gridTemplateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">样本均值</Text>
                        <Text fontWeight="bold">{sampleMean.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">样本标准差</Text>
                        <Text fontWeight="bold">{sampleStd.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">样本大小</Text>
                        <Text fontWeight="bold">{confidenceInterval.sampleSize}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信水平</Text>
                        <Text fontWeight="bold">{(confidenceLevel * 100).toFixed(0)}%</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">临界值</Text>
                        <Text fontWeight="bold">{confidenceInterval.criticalValue.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">标准误差</Text>
                        <Text fontWeight="bold">{confidenceInterval.standardError.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信下限</Text>
                        <Text fontWeight="bold" color="blue.600">{confidenceInterval.lower.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信上限</Text>
                        <Text fontWeight="bold" color="blue.600">{confidenceInterval.upper.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">边际误差</Text>
                        <Text fontWeight="bold">{confidenceInterval.marginOfError.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">样本类型</Text>
                        <Text fontWeight="bold">{confidenceInterval.isLargeSample ? '大样本' : '小样本'}</Text>
                      </Box>
                      <Box gridColumn="span 2">
                        <Text fontSize="sm" color="gray.600">计算方法</Text>
                        <Text fontWeight="bold">{confidenceInterval.method}</Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              )}
            </Grid>
          </TabPanel>

          {/* 比例置信区间面板 */}
          <TabPanel>
            <Grid gridTemplateColumns="1fr 2fr" gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="bold" mb={4}>参数设置</Text>
                  <FormLabel>置信水平</FormLabel>
                  <Select 
                    value={confidenceLevel.toString()} 
                    onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                    mb={4}
                  >
                    {confidenceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                  
                  <FormLabel mt={4}>成功次数</FormLabel>
                  <input
                    type="number"
                    value={successes}
                    onChange={(e) => handleSuccessesChange(parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginBottom: '12px'
                    }}
                    min="0"
                    max={trials}
                  />
                  
                  <FormLabel>试验总次数</FormLabel>
                  <input
                    type="number"
                    value={trials}
                    onChange={(e) => handleTrialsChange(parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginBottom: '12px'
                    }}
                    min="1"
                  />
                </CardBody>
              </Card>

              {proportionInterval && (
                <Card>
                  <CardBody>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>比例的置信区间结果</Text>
                    <Grid gridTemplateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">成功次数</Text>
                        <Text fontWeight="bold">{successes}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">试验总次数</Text>
                        <Text fontWeight="bold">{trials}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">样本比例</Text>
                        <Text fontWeight="bold">{(successes / trials).toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信水平</Text>
                        <Text fontWeight="bold">{(confidenceLevel * 100).toFixed(0)}%</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信下限</Text>
                        <Text fontWeight="bold" color="blue.600">{proportionInterval.lower.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">置信上限</Text>
                        <Text fontWeight="bold" color="blue.600">{proportionInterval.upper.toFixed(4)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">边际误差</Text>
                        <Text fontWeight="bold">{proportionInterval.marginOfError.toFixed(4)}</Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              )}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default ConfidenceIntervalTab;