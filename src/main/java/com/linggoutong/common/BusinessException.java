package com.linggoutong.common;

import lombok.Getter;

/**
 * 自定义业务异常类
 */
@Getter
public class BusinessException extends RuntimeException {

    /** 错误码 */
    private final int code;

    /** 默认错误码 */
    private static final int DEFAULT_ERROR_CODE = 9999;

    /**
     * 使用默认错误码 9999
     */
    public BusinessException(String message) {
        super(message);
        this.code = DEFAULT_ERROR_CODE;
    }

    /**
     * 使用自定义错误码
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    /**
     * 使用自定义错误码和原因
     */
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    /**
     * 使用默认错误码和原因
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = DEFAULT_ERROR_CODE;
    }
}
