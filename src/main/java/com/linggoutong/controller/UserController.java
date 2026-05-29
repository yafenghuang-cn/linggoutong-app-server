package com.linggoutong.controller;

import com.linggoutong.annotation.NoAuth;
import com.linggoutong.common.Result;
import com.linggoutong.dto.LoginRequest;
import com.linggoutong.dto.RegisterRequest;
import com.linggoutong.service.UserService;
import com.linggoutong.vo.LoginVO;
import com.linggoutong.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "用户管理", description = "用户注册、登录、信息查询等接口")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @NoAuth
    @Operation(summary = "用户登录", description = "用户登录获取 JWT Token")
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        LoginVO loginVO = userService.login(request);
        response.setHeader("Authorization", "Bearer " + loginVO.getToken());
        return Result.success(loginVO);
    }

    @NoAuth
    @Operation(summary = "用户注册", description = "新用户注册")
    @PostMapping("/register")
    public Result<UserVO> register(@RequestBody RegisterRequest request) {
        UserVO userVO = userService.register(request);
        return Result.success("注册成功", userVO);
    }

    @Operation(summary = "根据ID获取用户", description = "通过用户ID查询用户信息")
    @GetMapping("/{id}")
    public Result<UserVO> getUserById(@PathVariable Long id) {
        UserVO userVO = userService.getUserById(id);
        return Result.success(userVO);
    }

    @Operation(summary = "根据用户名获取用户", description = "通过用户名查询用户信息")
    @GetMapping("/username/{username}")
    public Result<UserVO> getUserByUsername(@PathVariable String username) {
        UserVO userVO = userService.getUserByUsername(username);
        return Result.success(userVO);
    }
}
