package com.linggoutong;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.linggoutong.mapper")
public class LingGouTongApplication {

    public static void main(String[] args) {
        SpringApplication.run(LingGouTongApplication.class, args);
    }
}
