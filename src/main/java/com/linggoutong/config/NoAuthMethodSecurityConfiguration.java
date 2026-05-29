package com.linggoutong.config;

import com.linggoutong.annotation.NoAuth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class NoAuthMethodSecurityConfiguration {

    /**
     * 检查方法或类是否有 @NoAuth 注解
     */
    public static boolean hasNoAuthAnnotation(Method method, Class<?> targetClass) {
        // 检查方法上的注解
        if (method.isAnnotationPresent(NoAuth.class)) {
            return true;
        }

        // 检查类上的注解
        if (targetClass.isAnnotationPresent(NoAuth.class)) {
            return true;
        }

        // 检查接口方法上的注解
        Class<?>[] interfaces = targetClass.getInterfaces();
        for (Class<?> iface : interfaces) {
            try {
                Method interfaceMethod = iface.getMethod(method.getName(), method.getParameterTypes());
                if (interfaceMethod.isAnnotationPresent(NoAuth.class)) {
                    return true;
                }
            } catch (NoSuchMethodException e) {
                // 接口中没有这个方法，继续检查下一个接口
            }
        }

        return false;
    }
}
