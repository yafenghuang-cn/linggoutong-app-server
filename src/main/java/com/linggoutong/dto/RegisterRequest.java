package com.linggoutong.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "注册请求参数")
public class RegisterRequest {

    @Schema(description = "用户名", required = true, example = "newuser")
    private String username;

    @Schema(description = "密码", required = true, example = "123456")
    private String password;

    @Schema(description = "昵称", example = "新用户")
    private String nickname;

    @Schema(description = "手机号", example = "13800138000")
    private String phone;

    @Schema(description = "邮箱", example = "user@example.com")
    private String email;
}
