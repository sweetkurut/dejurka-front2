import React from "react";
import { Form, Input, Button, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { useLoginMutation } from "../../store/api/authApi";
import { loginStart, loginSuccess, loginFailure } from "../../store/slices/authSlice";
import { LoginRequest } from "../../types";
import styles from "./Login.module.scss";

const mockUsers = [
    {
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        token: "mock-admin-token",
        fullName: "Администратор Системы",
    },
    {
        email: "agent@example.com",
        password: "agent123",
        role: "agent",
        token: "mock-agent-token",
        fullName: "Агент Иванов",
    },
];

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    // const [login] = useLoginMutation();

    // const onFinish = async (values: LoginRequest) => {
    //     try {
    //         dispatch(loginStart());
    //         const response = await login(values).unwrap();
    //         dispatch(loginSuccess(response));
    //         navigate("/dashboard");
    //     } catch (err: any) {
    //         dispatch(loginFailure(err.data?.message || "Ошибка авторизации"));
    //     }
    // };

    const onFinish = async (values: LoginRequest) => {
        try {
            dispatch(loginStart());

            const user = mockUsers.find((u) => u.email === values.email && u.password === values.password);

            if (!user) {
                throw new Error("Неверный email или пароль");
            }

            // Успешный вход
            dispatch(loginSuccess({ user, token: user.token })); // <-- важно
            navigate("/dashboard");
        } catch (err: any) {
            dispatch(loginFailure(err.message || "Ошибка авторизации"));
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>
                    <h1 className={styles.title}>Дежурка</h1>
                </div>

                <p className={styles.subtitle}>Войдите в систему управления объектами недвижимости</p>

                {error && <Alert message={error} type="error" showIcon className={styles.error} />}

                <Form name="login" onFinish={onFinish} autoComplete="off" className={styles.form}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Введите email!" },
                            { type: "email", message: "Некорректный email!" },
                        ]}
                        className={styles.formItem}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Введите пароль!" }]}
                        className={styles.formItem}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            className={styles.submitButton}
                        >
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
