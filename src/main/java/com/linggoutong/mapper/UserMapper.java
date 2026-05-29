package com.linggoutong.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linggoutong.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
