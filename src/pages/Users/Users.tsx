import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
    Typography,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    message,
    Popconfirm,
    Tooltip,
} from "antd";
import {
    UserAddOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    UserOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import { User } from "../../types";
import styles from "./Users.module.scss";
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetUsersQuery,
    useToggleUserStatusMutation,
    useUpdateUserMutation,
} from "@/api/usersApi";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();

    const { data: users = [], isLoading } = useGetUsersQuery();
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [toggleUserStatus] = useToggleUserStatusMutation();
    const [deleteUser] = useDeleteUserMutation();

    const handleToggleStatus = async (userId: string) => {
        try {
            await toggleUserStatus(userId).unwrap();
            message.success("Статус пользователя изменен");
        } catch {
            message.error("Ошибка при изменении статуса");
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            await deleteUser(userId).unwrap();
            message.success("Пользователь удалён");
        } catch {
            message.error("Ошибка при удалении");
        }
    };

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email: string, record: User) => (
                <div className={styles.userInfo}>
                    <UserOutlined className={styles.userIcon} />
                    <div>
                        <div className={styles.userName}>{record.fullName}</div>
                        <div className={styles.userEmail}>{email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "ФИО",
            dataIndex: "full_name",
            key: "full_name",
        },
        {
            title: "Роль",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (role: string) => {
                const roleColors = { admin: "red", agent: "blue" };
                const roleLabels = { admin: "Администратор", agent: "Агент" };
                return (
                    <Tag color={roleColors[role as keyof typeof roleColors]}>
                        {roleLabels[role as keyof typeof roleLabels]}
                    </Tag>
                );
            },
        },
        {
            title: "Статус",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? "success" : "error"}>{isActive ? "Активен" : "Заблокирован"}</Tag>
            ),
        },
        {
            title: "Дата создания",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 180,
            render: (_, record: User) =>
                currentUser?.role === "admin" && (
                    <Space size="small">
                        <Tooltip title="Редактировать">
                            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        </Tooltip>

                        <Tooltip title="Удалить пользователя">
                            <Popconfirm
                                title="Удалить этого пользователя?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Да"
                                cancelText="Отмена"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                ),
        },
    ];

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingUser) {
                await updateUser({ id: editingUser.id, data: values }).unwrap();
                message.success("Пользователь обновлен");
            } else {
                await createUser(values).unwrap();
                message.success("Пользователь создан");
            }
            setIsModalVisible(false);
            form.resetFields();
        } catch {
            message.error("Ошибка при сохранении");
        }
    };

    return (
        <div className={styles.users}>
            <div className={styles.header}>
                <Title level={2}>Сотрудники</Title>
                {currentUser?.role === "admin" && (
                    <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
                        Добавить сотрудника
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} сотрудников`,
                }}
            />

            <Modal
                title={editingUser ? "Редактировать сотрудника" : "Добавить сотрудника"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <Form.Item
                        name="full_name"
                        label="ФИО"
                        rules={[{ required: true, message: "Введите ФИО" }]}
                    >
                        <Input placeholder="Полное имя сотрудника" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Введите email" },
                            { type: "email", message: "Некорректный email" },
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true, message: "Выберите роль" }]}
                    >
                        <Select placeholder="Выберите роль">
                            <Option value="admin">Администратор</Option>
                            <Option value="agent">Агент</Option>
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Пароль"
                            rules={[
                                { required: true, message: "Введите пароль" },
                                { min: 6, message: "Минимум 6 символов" },
                            ]}
                        >
                            <Input.Password placeholder="Пароль" />
                        </Form.Item>
                    )}

                    <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Активный" unCheckedChildren="Неактивный" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                                {editingUser ? "Обновить" : "Создать"}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
