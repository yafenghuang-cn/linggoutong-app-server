package com.linggoutong.controller;

import com.linggoutong.annotation.NoAuth;
import com.linggoutong.common.Result;
import com.linggoutong.dto.LoginRequest;
import com.linggoutong.dto.RegisterRequest;
import com.linggoutong.service.UserService;
import com.linggoutong.vo.LoginVO;
import com.linggoutong.vo.UserVO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @NoAuth
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        LoginVO loginVO = userService.login(request);
        response.setHeader("Authorization", "Bearer " + loginVO.getToken());
        return Result.success(loginVO);
    }

    @NoAuth
    @PostMapping("/register")
    public Result<UserVO> register(@RequestBody RegisterRequest request) {
        UserVO userVO = userService.register(request);
        return Result.success("注册成功", userVO);
    }

    @GetMapping("/{id}")
    public Result<UserVO> getUserById(@PathVariable Long id) {
        UserVO userVO = userService.getUserById(id);
        return Result.success(userVO);
    }

    @GetMapping("/username/{username}")
    public Result<UserVO> getUserByUsername(@PathVariable String username) {
        UserVO userVO = userService.getUserByUsername(username);
        return Result.success(userVO);
    }
}
