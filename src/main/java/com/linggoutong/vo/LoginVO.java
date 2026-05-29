package com.linggoutong.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "登录响应结果")
public class LoginVO {

    @Schema(description = "JWT Token")
    private String token;

    @Schema(description = "用户信息")
    private UserVO user;
}
