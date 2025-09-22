import React from "react";
import { Card, Row, Col, Tag, Button, Space, Image, Descriptions, Typography, Spin, Alert } from "antd";
import {
    EditOutlined,
    ArrowLeftOutlined,
    HomeOutlined,
    UserOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useGetApartmentQuery } from "../../../store/api/apartmentsApi";
import {
    formatPrice,
    getRoomLabel,
    getRepairLabel,
    getFurnitureLabel,
    formatDate,
} from "../../../utils/helpers";
import styles from "./ApartmentDetail.module.scss";

const { Title, Text } = Typography;

const ApartmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: apartment, isLoading, error } = useGetApartmentQuery(id!);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !apartment) {
        return <Alert message="Ошибка" description="Объект не найден" type="error" showIcon />;
    }

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

    return (
        <div className={styles.apartmentDetail}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/apartments")}
                        className={styles.backButton}
                    >
                        Назад к списку
                    </Button>
                    <div className={styles.titleSection}>
                        <Title level={2} className={styles.title}>
                            {getRoomLabel(apartment.rooms)} квартира
                        </Title>
                        <Text type="secondary">ID: #{apartment.id.slice(-8)}</Text>
                    </div>
                </div>
                {(user?.role === "admin" || apartment.userId === user?.id) && (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/apartments/${apartment.id}/edit`)}
                    >
                        Редактировать
                    </Button>
                )}
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title="Основная информация" className={styles.mainCard}>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Адрес" span={2}>
                                <Text strong>{apartment.address}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Серия">{apartment.series}</Descriptions.Item>
                            <Descriptions.Item label="Район">{apartment.district}</Descriptions.Item>
                            <Descriptions.Item label="Комнат">
                                {getRoomLabel(apartment.rooms)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Площадь">{apartment.totalArea} м²</Descriptions.Item>
                            <Descriptions.Item label="Этаж">
                                {apartment.floor} из {apartment.totalFloors}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ремонт">
                                <Tag color={getRepairColor(apartment.repair)}>
                                    {getRepairLabel(apartment.repair)}
                                </Tag>
                            </Descriptions.Item>
                            {apartment.buildingCompany && (
                                <Descriptions.Item label="Стройкомпания">
                                    {apartment.buildingCompany}
                                </Descriptions.Item>
                            )}
                            {apartment.residentialComplex && (
                                <Descriptions.Item label="ЖК">
                                    {apartment.residentialComplex}
                                </Descriptions.Item>
                            )}
                            {apartment.section && (
                                <Descriptions.Item label="Расположение">
                                    {apartment.section === "corner" ? "Угловая" : "Не угловая"}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Отопление">{apartment.heating}</Descriptions.Item>
                            <Descriptions.Item label="Мебель">
                                {getFurnitureLabel(apartment.furniture)}
                            </Descriptions.Item>
                        </Descriptions>

                        {apartment.description && (
                            <div className={styles.description}>
                                <Title level={4}>Описание</Title>
                                <Text>{apartment.description}</Text>
                            </div>
                        )}
                    </Card>

                    {apartment.photos && apartment.photos.length > 0 && (
                        <Card title="Фотографии" className={styles.photosCard}>
                            <div className={styles.photoGrid}>
                                {apartment.photos.map((photo, index) => (
                                    <Image
                                        key={index}
                                        src={photo}
                                        alt={`Фото ${index + 1}`}
                                        className={styles.photo}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}
                </Col>

                <Col xs={24} lg={8}>
                    <Card className={styles.priceCard}>
                        <div className={styles.priceSection}>
                            <Title level={3} className={styles.price}>
                                {formatPrice(apartment.price)}
                            </Title>
                            {apartment.priceNet &&
                                (user?.role === "admin" || apartment.userId === user?.id) && (
                                    <Text type="secondary" className={styles.priceNet}>
                                        На руки: {formatPrice(apartment.priceNet)}
                                    </Text>
                                )}
                        </div>
                    </Card>

                    <Card title="Дополнительно" className={styles.additionalCard}>
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            {apartment.isBasement && (
                                <Tag color="orange" icon={<HomeOutlined />}>
                                    Цокольный этаж
                                </Tag>
                            )}
                            {apartment.isPenthouse && (
                                <Tag color="gold" icon={<HomeOutlined />}>
                                    Пентхаус
                                </Tag>
                            )}

                            {apartment.documents && apartment.documents.length > 0 && (
                                <div>
                                    <Text strong>Документы:</Text>
                                    <div className={styles.documents}>
                                        {apartment.documents.map((doc, index) => (
                                            <Tag key={index}>{doc}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Space>
                    </Card>

                    <Card title="Агент" className={styles.agentCard}>
                        <div className={styles.agentInfo}>
                            <UserOutlined className={styles.agentIcon} />
                            <div>
                                <Text strong>{apartment.user.fullName}</Text>
                                <br />
                                <Text type="secondary">{apartment.user.email}</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className={styles.metaCard}>
                        <Space direction="vertical" size="small">
                            <div className={styles.metaItem}>
                                <CalendarOutlined />
                                <Text type="secondary">Создано: {formatDate(apartment.createdAt)}</Text>
                            </div>
                            <div className={styles.metaItem}>
                                <CalendarOutlined />
                                <Text type="secondary">Обновлено: {formatDate(apartment.updatedAt)}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ApartmentDetail;
