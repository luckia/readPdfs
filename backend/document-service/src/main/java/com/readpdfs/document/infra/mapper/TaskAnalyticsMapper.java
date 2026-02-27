package com.readpdfs.document.infra.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface TaskAnalyticsMapper {

  @Select("SELECT 0")
  int placeholderMetric();
}
