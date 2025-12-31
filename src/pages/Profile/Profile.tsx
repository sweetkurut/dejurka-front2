import React, { useState } from "react";
import {
    Card,
    Row,
    Col,
    Form,
    Input,
    Button,
    Avatar,
    Typography,
    Table,
    Tag,
    Space,
    message,
    Statistic,
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    EyeOutlined,
    ApartmentOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";

import { formatPrice, getRoomLabel, getRepairLabel } from "../../utils/helpers";
import { Apartment } from "../../types";
import styles from "./Profile.module.scss";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/api/authApi";
import { useGetApartmentsQuery } from "@/api/apartmentsApi";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    const { data: profile } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const { data: apartmentsData } = useGetApartmentsQuery({
        filters: { userId: user?.id },
        limit: 100,
    });

    const userApartments = apartmentsData?.apartments || [];
    const totalValue = userApartments.reduce((sum, apt) => sum + apt.price, 0);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            render: (id: string) => `#${id.slice(-6)}`,
        },
        {
            title: "Адрес",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            width: 120,
        },
        {
            title: "Комнат",
            dataIndex: "rooms",
            key: "rooms",
            width: 80,
            render: (rooms: number) => getRoomLabel(rooms),
        },
        {
            title: "Площадь",
            dataIndex: "totalArea",
            key: "totalArea",
            width: 100,
            render: (area: number) => `${area} м²`,
        },
        {
            title: "Ремонт",
            dataIndex: "repair",
            key: "repair",
            width: 120,
            render: (repair: string) => <Tag color={getRepairColor(repair)}>{getRepairLabel(repair)}</Tag>,
        },
        {
            title: "Цена",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (price: number) => formatPrice(price),
        },
        {
            title: "Действия",
            key: "actions",
            width: 100,
            render: (_, record: Apartment) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/apartments/${record.id}`)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/apartments/${record.id}/edit`)}
                    />
                </Space>
            ),
        },
    ];

    const getRepairColor = (repair: string) => {
        const colors = {
            designer: "purple",
            euro: "blue",
            good: "green",
            cosmetic: "orange",
            pso: "red",
            old: "default",
        };
        return colors[repair as keyof typeof colors] || "default";
    };

    const handleEdit = () => {
        form.setFieldsValue(profile || user);
        setIsEditing(true);
    };

    const handleSave = async (values: any) => {
        try {
            await updateProfile(values).unwrap();
            message.success("Профиль обновлен");
            setIsEditing(false);
        } catch (error) {
            message.error("Ошибка при обновлении профиля");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        form.resetFields();
    };

    const currentUser = profile || user;

    return (
        <div className={styles.profile}>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <Avatar size={80} icon={<UserOutlined />} />
                            <div className={styles.profileInfo}>
                                <Title level={3} className={styles.userName}>
                                    {currentUser?.fullName}
                                </Title>
                                <Text type="secondary">{currentUser?.email}</Text>
                                <br />
                                <Tag color="blue">{getRoleLabel(currentUser?.role)}</Tag>
                            </div>
                        </div>

                        {!isEditing ? (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                                className={styles.editButton}
                            >
                                Редактировать профиль
                            </Button>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSave}
                                className={styles.editForm}
                            >
                                <Form.Item
                                    name="fullName"
                                    label="ФИО"
                                    rules={[{ required: true, message: "Введите ФИО" }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: "Введите email" },
                                        { type: "email", message: "Некорректный email" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={isUpdating}
                                    >
                                        Сохранить
                                    </Button>
                                    <Button onClick={handleCancel}>Отмена</Button>
                                </Space>
                            </Form>
                        )}
                    </Card>

                    <Card title="Статистика" className={styles.statsCard}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Statistic
                                    title="Объектов в работе"
                                    value={userApartments.length}
                                    prefix={<ApartmentOutlined />}
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title="Общая стоимость"
                                    value={totalValue}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) => formatPrice(Number(value))}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        title="Мои объекты"
                        extra={
                            <Button type="primary" onClick={() => navigate("/apartments/add")}>
                                Добавить объект
                            </Button>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={userApartments}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} объектов`,
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const getRoleLabel = (role?: string) => {
    const labels = {
        admin: "Администратор",
        agent: "Агент",
    };
    return labels[role as keyof typeof labels] || role;
};

export default Profile;
