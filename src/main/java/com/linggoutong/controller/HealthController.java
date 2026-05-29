package com.linggoutong.controller;

import com.linggoutong.annotation.NoAuth;
import com.linggoutong.common.BusinessException;
import com.linggoutong.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "健康检查", description = "服务健康状态检查接口")
public class HealthController {
    @NoAuth
    @Operation(summary = "健康检查", description = "检查服务运行状态")
    @GetMapping("/health")
    public Result<Map<String, String>> health() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "linggoutong-app-server");
        return Result.success(data);
    }
}
