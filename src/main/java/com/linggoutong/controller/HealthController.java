package com.linggoutong.controller;

import com.linggoutong.common.BusinessException;
import com.linggoutong.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Result<Map<String, String>> health() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "linggoutong-app-server");
        return Result.success(data);
    }
}
