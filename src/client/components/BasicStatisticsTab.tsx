import React, { useState, useEffect } from 'react';
import { Box, Text, Grid, GridItem, Card, CardBody, Slider, SliderTrack, SliderFilledTrack, SliderThumb, FormLabel } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, ScatterChart, Scatter, ZAxis } from 'recharts';
import { BasicStatisticsTabProps } from '../types';
import { calculateMean, calculateMedian, calculateMode, calculateVariance, calculateStd, calculateQuartiles, generateHistogramData as utilsGenerateHistogramData } from '../utils/statistics';

function BasicStatisticsTab({ dataset }: BasicStatisticsTabProps) {
  const [stats, setStats] = useState<{
    mean: number;
    median: number;
    mode: number | null;
    variance: number;
    std: number;
    min: number;
    max: number;
    range: number;
    q1: number;
    q3: number;
    iqr: number;
  } | null>(null);
  
  const [histogramData, setHistogramData] = useState<{ name: string; value: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<{ index: number; value: number }[]>([]);
  const [boxplotData, setBoxplotData] = useState<{ name: string; min: number; q1: number; median: number; q3: number; max: number; outliers: number[] }[]>([]);
  const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5); // 异常值检测阈值
  const [showOutliers, setShowOutliers] = useState<boolean>(true); // 是否显示异常值

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      calculateStats(dataset);
      generateHistogramData(dataset);
      generateTimeSeriesData(dataset);
      generateBoxplotData(dataset);
    }
  }, [dataset, iqrMultiplier, showOutliers]);

  const calculateStats = (data: number[]) => {
    const sortedData = [...data].sort((a, b) => a - b);
    const n = sortedData.length;
    
    // 使用共享的统计函数
    const mean = calculateMean(data);
    const median = calculateMedian(data);
    const mode = calculateMode(data);
    const variance = calculateVariance(data);
    const std = calculateStd(data);
    const { q1, q3, iqr } = calculateQuartiles(data);
    
    // 计算最小值、最大值和范围
    const min = sortedData[0];
    const max = sortedData[n - 1];
    const range = max - min;
    
    setStats({
      mean,
      median,
      mode,
      variance,
      std,
      min,
      max,
      range,
      q1,
      q3,
      iqr,
    });
  };

  const generateHistogramData = (data: number[]) => {
    const histogramData = utilsGenerateHistogramData(data);
    setHistogramData(histogramData);
  };

  const generateTimeSeriesData = (data: number[]) => {
    const timeData = data.map((value, index) => ({
      index,
      value,
    }));
    setTimeSeriesData(timeData);
  };

  const generateBoxplotData = (data: number[]) => {
    if (!stats) return;
    
    const sortedData = [...data].sort((a, b) => a - b);
    const { q1, q3, iqr, median } = stats;
    
    // 计算异常值边界
    const lowerBound = q1 - iqrMultiplier * iqr;
    const upperBound = q3 + iqrMultiplier * iqr;
    
    try {
      // 找出正常值的范围（不包含异常值）
      const nonOutliers = sortedData.filter(val => val >= lowerBound && val <= upperBound);
      const boxMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
      const boxMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
      
      // 收集异常值
      const outliers = sortedData.filter(val => val < lowerBound || val > upperBound);
      
      setBoxplotData([{
        name: '数据分布',
        min: boxMin,
        q1: q1,
        median: median,
        q3: q3,
        max: boxMax,
        outliers: showOutliers ? outliers : []
      }]);
    } catch (error) {
      console.error('生成箱线图数据时出错:', error);
      // 提供默认值以防止白屏
      setBoxplotData([{
        name: '数据分布',
        min: q1 - iqr,
        q1: q1,
        median: median,
        q3: q3,
        max: q3 + iqr,
        outliers: []
      }]);
    }
  };

  // 处理IQR乘数变化
  const handleIqrMultiplierChange = (val: number) => {
    setIqrMultiplier(val);
  };

  // 处理是否显示异常值变化
  const handleShowOutliersChange = (checked: boolean) => {
    setShowOutliers(checked);
  };

  if (!stats) {
    return <Text>计算统计数据中...</Text>;
  }

  return (
    <Box p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={6}>基本统计分析结果</Text>
      
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4} mb={8}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">均值</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.mean.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">中位数</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.median.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">众数</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.mode !== null ? stats.mode.toFixed(4) : '无唯一众数'}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">标准差</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.std.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">最小值</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.min.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">最大值</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.max.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">四分位距</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.iqr.toFixed(4)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">样本大小</Text>
            <Text fontSize="2xl" fontWeight="bold">{dataset.length}</Text>
          </CardBody>
        </Card>
      </Grid>
      
      <Grid templateColumns="1fr 1fr" gap={6} mb={6}>
        <GridItem>
          <Text fontSize="lg" fontWeight="bold" mb={4}>直方图</Text>
          <Box height="400px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
        
        <GridItem>
          <Text fontSize="lg" fontWeight="bold" mb={4}>时间序列图</Text>
          <Box height="400px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: '索引', position: 'insideBottomRight', offset: -10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
      </Grid>

      {/* 箱线图区域 */}
      <Grid templateColumns="1fr 3fr" gap={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="bold" mb={4}>箱线图设置</Text>
              
              {/* 异常值检测阈值设置 */}
              <div style={{ marginBottom: '16px' }}>
                <FormLabel>异常值检测阈值: {iqrMultiplier.toFixed(1)} × IQR</FormLabel>
                <Slider
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={iqrMultiplier}
                  onChange={handleIqrMultiplierChange}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="sm" color="gray.500">
                  调整用于检测异常值的IQR倍数
                </Text>
              </div>

              {/* 显示异常值选项 */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                <input
                  type="checkbox"
                  checked={showOutliers}
                  onChange={(e) => handleShowOutliersChange(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <FormLabel style={{ margin: 0 }}>
                  显示异常值
                </FormLabel>
              </div>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Text fontSize="lg" fontWeight="bold" mb={4}>箱线图</Text>
          <Box height="400px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={boxplotData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={['dataMin - 10%', 'dataMax + 10%']} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.name}</p>
                        <p>最小值: {data.min.toFixed(4)}</p>
                        <p>Q1: {data.q1.toFixed(4)}</p>
                        <p>中位数: {data.median.toFixed(4)}</p>
                        <p>Q3: {data.q3.toFixed(4)}</p>
                        <p>最大值: {data.max.toFixed(4)}</p>
                        {data.outliers.length > 0 && (
                          <p>异常值数量: {data.outliers.length}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }} />
                
                {/* 箱体 */}
                <Bar dataKey="q1" stackId="a" fill="transparent" hide />
                <Bar dataKey={(entry) => entry.q3 - entry.q1} stackId="a" fill="#3b82f6" />
                
                {/* 中位数线 */}
                {boxplotData.map((entry, index) => (
                  <ReferenceLine
                key={`median-${index}`}
                y={index}
                yAxisId="left"
                stroke="#ef4444"
                strokeWidth={2}
                value={entry.median.toString()}
              />
                ))}
                
                {/* 须线 */}
                {boxplotData.map((entry, index) => (
                  <React.Fragment key={`whiskers-${index}`}>
                    <Line
                      dataKey="min"
                      type="monotone"
                      stroke="#000"
                      strokeWidth={1}
                      dot={false}
                      data={[
                        { name: entry.name, min: entry.min, y: index },
                        { name: entry.name, min: entry.q1, y: index }
                      ]}
                    />
                    <Line
                      dataKey="max"
                      type="monotone"
                      stroke="#000"
                      strokeWidth={1}
                      dot={false}
                      data={[
                        { name: entry.name, max: entry.q3, y: index },
                        { name: entry.name, max: entry.max, y: index }
                      ]}
                    />
                  </React.Fragment>
                ))}
                
                {/* 异常值 */}
                {boxplotData.length > 0 && boxplotData[0].outliers.length > 0 && (
                  <ScatterChart>
                    <ZAxis type="number" range={[60, 60]} />
                    <Scatter
                      data={boxplotData.flatMap((entry, index) =>
                        entry.outliers.map((outlier, i) => ({
                          name: entry.name,
                          value: outlier,
                          y: index,
                          key: `outlier-${index}-${i}`
                        }))
                      )}
                      fill="#ef4444"
                    />
                  </ScatterChart>
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default BasicStatisticsTab;