package com.readpdfs.extraction.infra.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ExtractionMetricsMapper {

  @Select("SELECT 0")
  int placeholderMetric();
}
