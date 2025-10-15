// 统计计算工具函数
// 导入math库已移除，因为当前实现不再需要

/**
 * 计算t分布临界值（近似计算）
 * @param degreesOfFreedom 自由度
 * @param confidenceLevel 置信水平
 * @returns t分布临界值
 */
export const calculateTCriticalValue = (degreesOfFreedom: number, confidenceLevel: number): number => {
  // 简化版t分布临界值计算
  // 实际应用中可能需要更精确的方法或使用统计库
  const alpha = 1 - confidenceLevel;
  const tailProbability = alpha / 2;
  
  // 使用近似公式计算t临界值
  // 对于大自由度，接近z分布临界值
  if (degreesOfFreedom >= 1000) {
    if (confidenceLevel === 0.90) return 1.645;
    if (confidenceLevel === 0.95) return 1.96;
    if (confidenceLevel === 0.99) return 2.576;
  }
  
  // 对于中小自由度的近似值
  // 这里使用简化的近似公式
  const z = confidenceLevel === 0.90 ? 1.645 : 
            confidenceLevel === 0.95 ? 1.96 : 2.576;
  
  const t = z * (1 + z * z / (4 * degreesOfFreedom));
  return Math.max(1.0, t); // 确保至少为1.0
};

/**
 * 计算z分布临界值
 * @param confidenceLevel 置信水平
 * @returns z分布临界值
 */
export const calculateZCriticalValue = (confidenceLevel: number): number => {
  // 根据置信水平返回对应的z临界值
  if (confidenceLevel === 0.90) return 1.645;
  if (confidenceLevel === 0.95) return 1.96;
  if (confidenceLevel === 0.99) return 2.576;
  
  // 对于其他置信水平，这里使用近似值
  // 实际应用中可能需要更精确的方法
  const alpha = 1 - confidenceLevel;
  const tailProbability = alpha / 2;
  
  // 使用经验公式近似z值
  if (tailProbability > 0.0001) {
    // 简化的近似公式
    const z = Math.sqrt(-2 * Math.log(tailProbability)) * 
              (1 - 1/(2 * Math.pow(-2 * Math.log(tailProbability), 2)));
    return Math.max(1.0, Math.min(4.0, z));
  }
  
  return 3.89; // 对于极小的尾概率，返回近似值
};

/**
 * 计算均值的置信区间
 * @param data 数据数组
 * @param confidenceLevel 置信水平（0-1），默认0.95
 * @param populationVarianceKnown 是否已知总体方差
 * @param assumedPopulationVariance 假设的总体方差（如果已知）
 * @returns 包含置信下限、上限和边际误差的对象
 */
export const calculateMeanConfidenceInterval = (
  data: number[],
  confidenceLevel: number = 0.95,
  populationVarianceKnown: boolean = false,
  assumedPopulationVariance?: number
): { 
  lower: number; 
  upper: number; 
  marginOfError: number; 
  method: string;
  criticalValue: number;
  standardError: number;
  sampleSize: number;
  isLargeSample: boolean;
} => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }

  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const sampleVariance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const sampleStd = Math.sqrt(sampleVariance);
  
  // 判断样本量大小（通常n >= 30视为大样本）
  const isLargeSample = n >= 30;
  let criticalValue: number;
  let standardError: number;
  let method: string;
  
  if (populationVarianceKnown && assumedPopulationVariance !== undefined) {
    // 总体方差已知情况，使用z分布
    criticalValue = calculateZCriticalValue(confidenceLevel);
    standardError = Math.sqrt(assumedPopulationVariance) / Math.sqrt(n);
    method = '总体方差已知，使用z分布';
  } else {
    if (isLargeSample) {
      // 大样本情况下，即使总体方差未知，也可以使用z分布近似
      criticalValue = calculateZCriticalValue(confidenceLevel);
      standardError = sampleStd / Math.sqrt(n);
      method = '大样本，总体方差未知，使用z分布近似';
    } else {
      // 小样本情况下，总体方差未知，使用t分布
      const degreesOfFreedom = n - 1;
      criticalValue = calculateTCriticalValue(degreesOfFreedom, confidenceLevel);
      standardError = sampleStd / Math.sqrt(n);
      method = '小样本，总体方差未知，使用t分布';
    }
  }
  
  const marginOfError = criticalValue * standardError;
  
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    marginOfError,
    method,
    criticalValue,
    standardError,
    sampleSize: n,
    isLargeSample
  };
};

/**
 * 计算比例的置信区间（二项分布）
 * @param successes 成功次数
 * @param trials 试验总次数
 * @param confidenceLevel 置信水平
 * @returns 置信区间对象
 */
export const calculateProportionConfidenceInterval = (
  successes: number,
  trials: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; marginOfError: number } => {
  if (trials <= 0 || successes < 0 || successes > trials) {
    throw new Error('无效的成功次数或试验次数');
  }
  
  const proportion = successes / trials;
  
  // 使用z分布临界值
  let criticalValue = 1.96; // 默认95%置信水平
  if (confidenceLevel === 0.90) criticalValue = 1.645;
  if (confidenceLevel === 0.99) criticalValue = 2.576;
  
  const standardError = Math.sqrt((proportion * (1 - proportion)) / trials);
  const marginOfError = criticalValue * standardError;
  
  // 确保置信区间在[0, 1]范围内
  const lower = Math.max(0, proportion - marginOfError);
  const upper = Math.min(1, proportion + marginOfError);
  
  return {
    lower,
    upper,
    marginOfError
  };
};

/**
 * 计算MLE估计
 */
export const calculateMLE = (data: number[], distType: string): Record<string, number> => {
  const results: Record<string, number> = {};
  const n = data.length;
  
  switch (distType) {
    case 'normal': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const std = Math.sqrt(variance);
      results.mean = mean;
      results.std = std;
      break;
    }
    case 'uniform': {
      const min = Math.min(...data);
      const max = Math.max(...data);
      results.a = min;
      results.b = max;
      break;
    }
    case 'exponential': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      results.lambda = 1 / mean;
      break;
    }
    case 'poisson': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      results.lambda = mean;
      break;
    }
    case 'gamma': {
      // 伽马分布的MoM估计作为MLE的替代方案
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      
      // 使用MoM估计作为简化版的MLE
      results.shape = Math.max(0.001, Math.pow(mean, 2) / variance);
      results.scale = variance / mean;
      break;
    }
    case 'beta': {
      // 贝塔分布的MoM估计作为MLE的替代方案
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      
      // 使用MoM估计作为简化版的MLE
      const s = (mean * (1 - mean) / variance) - 1;
      results.alpha = mean * s;
      results.beta = (1 - mean) * s;
      break;
    }
    default:
      throw new Error(`不支持的分布类型: ${distType}`);
  }
  
  return results;
};

/**
 * 计算MoM估计
 */
export const calculateMoM = (data: number[], distType: string): Record<string, number> => {
  const results: Record<string, number> = {};
  const n = data.length;
  
  switch (distType) {
    case 'normal': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const std = Math.sqrt(variance);
      results.mean = mean;
      results.std = std;
      break;
    }
    case 'uniform': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const range = Math.sqrt(12 * variance);
      results.a = mean - range / 2;
      results.b = mean + range / 2;
      break;
    }
    case 'exponential': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      results.lambda = 1 / mean;
      break;
    }
    case 'poisson': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      results.lambda = mean;
      break;
    }
    case 'gamma': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      
      // MoM估计：shape = mean^2 / variance, scale = variance / mean
      results.shape = Math.max(0.001, Math.pow(mean, 2) / variance);
      results.scale = variance / mean;
      break;
    }
    case 'beta': {
      const mean = data.reduce((sum, val) => sum + val, 0) / n;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      
      // MoM估计
      const s = (mean * (1 - mean) / variance) - 1;
      results.alpha = mean * s;
      results.beta = (1 - mean) * s;
      break;
    }
    default:
      throw new Error(`不支持的分布类型: ${distType}`);
  }
  
  return results;
};

/**
 * 计算偏度
 */
export const calculateSkewness = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const mean = calculateMean(data);
  const std = calculateStd(data);
  
  // 确保标准差不为零
  if (std === 0) {
    return 0;
  }
  
  const thirdMoment = data.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
  return thirdMoment / Math.pow(std, 3);
};

/**
 * 计算峰度
 */
export const calculateKurtosis = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const mean = calculateMean(data);
  const std = calculateStd(data);
  
  // 确保标准差不为零
  if (std === 0) {
    return 0;
  }
  
  const fourthMoment = data.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n;
  return (fourthMoment / Math.pow(std, 4)) - 3; // 减去3得到超额峰度
};

/**
 * 计算数组的均值
 */
export const calculateMean = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

/**
 * 计算数组的中位数
 */
export const calculateMedian = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  if (n % 2 === 0) {
    return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
  } else {
    return sortedData[Math.floor(n / 2)];
  }
};

/**
 * 计算数组的众数
 */
export const calculateMode = (data: number[]): number | null => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const frequencyMap: Record<number, number> = {};
  let maxFreq = 0;
  let mode: number | null = null;
  
  data.forEach((num) => {
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    if (frequencyMap[num] > maxFreq) {
      maxFreq = frequencyMap[num];
      mode = num;
    } else if (frequencyMap[num] === maxFreq && num !== mode) {
      mode = null; // 多众数情况
    }
  });
  
  return mode;
};

/**
 * 计算数组的方差
 */
export const calculateVariance = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  const mean = calculateMean(data);
  const sumSquaredDiffs = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return sumSquaredDiffs / data.length;
};

/**
 * 计算数组的标准差
 */
export const calculateStd = (data: number[]): number => {
  return Math.sqrt(calculateVariance(data));
};

/**
 * 计算数组的四分位数
 */
export const calculateQuartiles = (data: number[]): { q1: number; q3: number; iqr: number } => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  const q1 = sortedData[Math.floor(n * 0.25)];
  const q3 = sortedData[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  return { q1, q3, iqr };
};

/**
 * 计算描述性统计量
 */
export const calculateDescriptiveStats = (data: number[]): {
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
  count: number;
} => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  return {
    mean: calculateMean(data),
    median: calculateMedian(data),
    mode: calculateMode(data),
    variance: calculateVariance(data),
    std: calculateStd(data),
    min: sortedData[0],
    max: sortedData[n - 1],
    range: sortedData[n - 1] - sortedData[0],
    ...calculateQuartiles(data),
    count: n,
  };
};

/**
 * 生成直方图数据
 */
export const generateHistogramData = (data: number[], numBins?: number): { name: string; value: number }[] => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const binsCount = numBins || Math.ceil(Math.sqrt(n));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / binsCount;
  
  const bins: { name: string; value: number }[] = [];
  
  for (let i = 0; i < binsCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = binMin + binWidth;
    const count = data.filter((val) => val >= binMin && val < binMax).length;
    bins.push({
      name: `${binMin.toFixed(2)}-${binMax.toFixed(2)}`,
      value: count,
    });
  }
  
  return bins;
};