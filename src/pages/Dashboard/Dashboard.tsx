import React, { useState } from "react";
import { Typography, Card, Statistic, Table, Input, Select, Button, Space, Tag, Tooltip } from "antd";
import {
    ApartmentOutlined,
    UserOutlined,
    DollarOutlined,
    EyeOutlined,
    EditOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useGetApartmentsQuery } from "../../store/api/apartmentsApi";
import { useGetDirectoriesQuery } from "../../store/api/directoriesApi";
import { Apartment, ApartmentFilters } from "../../types";
import { formatPrice, getRoomLabel, getRepairLabel } from "../../utils/helpers";
import styles from "./Dashboard.module.scss";

const { Title } = Typography;

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

    const { data: series = [] } = useGetDirectoriesQuery("series");
    const { data: districts = [] } = useGetDirectoriesQuery("district");

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            render: (id: string) => (
                <Button type="link" onClick={() => navigate(`/apartments/${id}`)}>
                    #{id.slice(-6)}
                </Button>
            ),
        },
        {
            title: "Адрес",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
        },
        {
            title: "Серия",
            dataIndex: "series",
            key: "series",
            width: 120,
        },
        {
            title: "Район",
            dataIndex: "district",
            key: "district",
            width: 150,
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
            title: "Этаж",
            dataIndex: "floor",
            key: "floor",
            width: 100,
            render: (floor: number, record: Apartment) => `${floor}/${record.totalFloors}`,
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
            title: "Агент",
            dataIndex: ["user", "fullName"],
            key: "user",
            width: 150,
            ellipsis: true,
            render: (name: string, record: Apartment) => {
                // Агенты видят только свои объекты, поэтому не показываем колонку агента
                if (user?.role === "agent") return null;
                return name;
            },
        },
        {
            title: "Действия",
            key: "actions",
            width: 100,
            render: (_, record: Apartment) => (
                <Space size="small" className={styles.tableActions}>
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
                            disabled={user?.role === "agent" && record.userId !== user.id}
                        />
                    </Tooltip>
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
        totalUsers: 15,
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

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h4 className={styles.statTitle}>Средняя цена</h4>
                        <DollarOutlined className={styles.statIcon} />
                    </div>
                    <h2 className={styles.statValue}>{formatPrice(mockStats.averagePrice)}</h2>
                </Card>

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
                    {[1, 2, 3, 4, 5].map((num) => (
                        <Select.Option key={num} value={num}>
                            {getRoomLabel(num)}
                        </Select.Option>
                    ))}
                </Select>
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
