package com.linggoutong.service;

import com.linggoutong.dto.LoginRequest;
import com.linggoutong.dto.RegisterRequest;
import com.linggoutong.vo.LoginVO;
import com.linggoutong.vo.UserVO;

public interface UserService {

    /**
     * 用户登录
     */
    LoginVO login(LoginRequest request);

    /**
     * 用户注册
     */
    UserVO register(RegisterRequest request);

    /**
     * 根据用户ID查询用户信息
     */
    UserVO getUserById(Long id);

    /**
     * 根据用户名查询用户信息
     */
    UserVO getUserByUsername(String username);
}
