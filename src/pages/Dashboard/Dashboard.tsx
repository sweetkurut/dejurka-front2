/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Typography, Card, Table, Input, Select, Button, Space, Tooltip, Popconfirm, message } from "antd";
import {
    ApartmentOutlined,
    UserOutlined,
    EyeOutlined,
    EditOutlined,
    SearchOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

// import { formatPrice, getRoomLabel, getRepairLabel } from "../../utils/helpers";
import styles from "./Dashboard.module.scss";
import { useDeleteApartmentMutation, useGetApartmentsQuery } from "@/api/apartmentsApi";
import { ApartmentFilters } from "@/types";
import { useGetDirectoriesQuery } from "@/api/directoriesApi";
import { useGetUsersQuery } from "@/api/usersApi";

const { Title } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ApartmentFilters>({});

    // Для агентов показываем только их объекты
    const queryFilters = user?.role === "agent" ? { ...filters, userId: user.id } : filters;

    const { data: apartmentsData, isLoading } = useGetApartmentsQuery({
        page: currentPage,
        limit: 20,
        filters: queryFilters,
    });

    const { data: roomcount = [] } = useGetDirectoriesQuery("roomcount");

    const { data: series = [] } = useGetDirectoriesQuery("series");
    const { data: districts = [] } = useGetDirectoriesQuery("district");
    const { data: users = [] } = useGetUsersQuery("users");
    const [deleteApartment] = useDeleteApartmentMutation();

    const handleDelete = async (id: string) => {
        try {
            await deleteApartment(id).unwrap();
            message.success("Запись удалена");
        } catch (error) {
            console.error(error);

            message.error("Ошибка при удалении");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            render: (id: string) => (
                <Button type="link" onClick={() => navigate(`/${id}`)}>
                    #{id.slice(-6)}
                </Button>
            ),
        },
        {
            title: "Адрес",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            width: 120,
        },
        {
            title: "Серия",
            key: "series",
            render: (_: any, record: any) => record.series?.name || "—",
            width: 120,
        },
        {
            title: "Район",
            key: "district",
            render: (_: any, record: any) => record.district?.name || "—",
            width: 120,
        },

        {
            title: "Комнат",
            key: "rooms_count",
            render: (_: any, record: any) => record.rooms_count?.name ?? "—",
            width: 80,
        },

        {
            title: "Площадь",
            dataIndex: "area_total",
            key: "area_total",
            width: 100,
            render: (area: number) => `${area} м²`,
        },
        {
            title: "Этаж",
            dataIndex: "floor_type",
            key: "floor_type",
            width: 100,
        },
        {
            title: "Ремонт",
            key: "renovation_type",
            render: (_: any, record: any) => record.renovation_type?.name || "—",
            width: 120,
        },
        {
            title: "Цена (публ.)",
            dataIndex: "price_visible",
            key: "price_visible",
            width: 120,
            render: (price: number) => `${price.toLocaleString()} $`,
        },
        {
            title: "Создал",
            key: "created_by",
            width: 150,
            render: (_: any, record: any) => record.created_by?.full_name || "—",
        },
        {
            title: "Действия",
            key: "actions",
            width: 100,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Просмотр">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/apartments/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Редактировать">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/apartments/${record.id}/edit`)}
                            // disabled={user?.role === "agent" && record.userId !== user.id}
                        />
                    </Tooltip>
                    <Space size="small">
                        <Popconfirm
                            title="Удалить запись?"
                            description="Это действие нельзя отменить"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Да"
                            cancelText="Отмена"
                        >
                            <Button type="text" icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                    </Space>
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

    const handleSearch = (value: string) => {
        setFilters({ ...filters, search: value });
    };

    const handleFilterChange = (key: keyof ApartmentFilters, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const mockStats = {
        totalApartments: apartmentsData?.total || 0,
        totalUsers: users?.length || 0,
        averagePrice: 2500000,
        newThisMonth: 5,
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <Title level={2} className={styles.title}>
                    Дашборд
                </Title>
                <Button type="primary" onClick={() => navigate("/apartments/add")}>
                    Добавить объект
                </Button>
            </div>

            <div className={styles.stats}>
                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h4 className={styles.statTitle}>Всего объектов</h4>
                        <ApartmentOutlined className={styles.statIcon} />
                    </div>
                    <h2 className={styles.statValue}>{mockStats.totalApartments}</h2>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h4 className={styles.statTitle}>Агентов</h4>
                        <UserOutlined className={styles.statIcon} />
                    </div>
                    <h2 className={styles.statValue}>{mockStats.totalUsers}</h2>
                </Card>

                {/* <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h4 className={styles.statTitle}>Средняя цена</h4>
                        <DollarOutlined className={styles.statIcon} />
                    </div>
                    <h2 className={styles.statValue}>{formatPrice(mockStats.averagePrice)}</h2>
                </Card> */}

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h4 className={styles.statTitle}>Новых за месяц</h4>
                        <ApartmentOutlined className={styles.statIcon} />
                    </div>
                    <h2 className={styles.statValue}>{mockStats.newThisMonth}</h2>
                </Card>
            </div>

            <div className={styles.filters}>
                <Input.Search
                    placeholder="Поиск по ID или адресу"
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                    prefix={<SearchOutlined />}
                    className={styles.filterItem}
                />

                <Select
                    placeholder="Серия"
                    allowClear
                    onChange={(value) => handleFilterChange("series", value)}
                    className={styles.filterItem}
                >
                    {series.map((item) => (
                        <Select.Option key={item.id} value={item.name}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    placeholder="Район"
                    allowClear
                    onChange={(value) => handleFilterChange("district", value)}
                    className={styles.filterItem}
                >
                    {districts.map((item) => (
                        <Select.Option key={item.id} value={item.name}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    placeholder="Комнаты"
                    allowClear
                    onChange={(value) => handleFilterChange("rooms", value)}
                    className={styles.filterItem}
                >
                    {roomcount.map((option) => (
                        <Option key={option.id} value={option.id}>
                            {option.name}
                        </Option>
                    ))}
                </Select>

                {/* <Select placeholder="Количество комнат">
                    {roomcount.map((option) => (
                        <Option key={option.id} value={option.id}>
                            {option.name}
                        </Option>
                    ))}
                </Select> */}
            </div>

            <Table
                columns={columns}
                dataSource={apartmentsData?.apartments || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: currentPage,
                    total: apartmentsData?.total || 0,
                    pageSize: 20,
                    onChange: setCurrentPage,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} объектов`,
                }}
                scroll={{ x: 1200 }}
            />
        </div>
    );
};

export default Dashboard;
