import React from "react";
import { Card, Row, Col, Tag, Button, Space, Image, Descriptions, Typography, Spin, Alert } from "antd";
import { EditOutlined, ArrowLeftOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    formatPrice,
    getRoomLabel,
    getRepairLabel,
    getFurnitureLabel,
    formatDate,
} from "../../../utils/helpers";
import styles from "./ApartmentDetail.module.scss";
import { useGetApartmentQuery } from "@/api/apartmentsApi";

const { Title, Text } = Typography;

const ApartmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: apartment, isLoading, error } = useGetApartmentQuery(id!);

    if (isLoading)
        return (
            <div className={styles.loading}>
                <Spin size="large" />
            </div>
        );
    if (error || !apartment)
        return <Alert message="Ошибка" description="Объект не найден" type="error" showIcon />;

    const getRepairColor = (repair: string) => {
        const colors: Record<string, string> = {
            designer: "purple",
            euro: "blue",
            good: "green",
            cosmetic: "orange",
            pso: "red",
            old: "default",
        };
        return colors[repair] || "default";
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
                            {getRoomLabel(apartment.rooms_count?.name ?? "")} квартира
                        </Title>
                        <Text type="secondary">ID: #{apartment.id.slice(-8)}</Text>
                    </div>
                </div>
                {(user?.role === "admin" || apartment.created_by?.id === user?.id) && (
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
                            <Descriptions.Item label="Серия">
                                {apartment.series?.name ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Район">
                                {apartment.district?.name ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Комнат">
                                {getRoomLabel(apartment.rooms_count?.name ?? "")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Площадь">{apartment.area_total} м²</Descriptions.Item>
                            <Descriptions.Item label="Этаж">{apartment.floor_type ?? "-"}</Descriptions.Item>
                            <Descriptions.Item label="Ремонт">
                                <Tag color={getRepairColor(apartment.renovation_type?.name ?? "")}>
                                    {getRepairLabel(apartment.renovation_type?.name ?? "")}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Расположение">
                                {apartment.corner_type ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Отопление">
                                {apartment.heating_type?.name ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Мебель">
                                {getFurnitureLabel(apartment.furniture?.name ?? "-")}
                            </Descriptions.Item>
                        </Descriptions>

                        {apartment.description && (
                            <div className={styles.description}>
                                <Title level={4}>Описание</Title>
                                <Text>{apartment.description}</Text>
                            </div>
                        )}
                    </Card>

                    <Card title="Фотографии" className={styles.photosCard}>
                        {apartment.photos && apartment.photos.length > 0 ? (
                            <div className={styles.photoGrid}>
                                {apartment.photos.map((photo, idx) => (
                                    <Image
                                        key={idx}
                                        src={photo}
                                        alt={`Фото ${idx + 1}`}
                                        className={styles.photo}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Text>Фото нет</Text>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className={styles.priceCard}>
                        <div className={styles.priceSection}>
                            <Title level={3} className={styles.price}>
                                {formatPrice(apartment.price_visible)}
                            </Title>
                            {apartment.price_hidden &&
                                (user?.role === "admin" || apartment.created_by?.id === user?.id) && (
                                    <Text type="secondary" className={styles.priceNet}>
                                        На руки: {formatPrice(apartment.price_hidden)}
                                    </Text>
                                )}
                        </div>
                    </Card>

                    <Card title="Дополнительно" className={styles.additionalCard}>
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            {apartment.documents && apartment.documents.length > 0 ? (
                                <div>
                                    <Text strong>Документы:</Text>
                                    <div className={styles.documents}>
                                        {apartment.documents.map((doc) => (
                                            <Tag key={doc.id}>{doc.name}</Tag>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Text>Документы отсутствуют</Text>
                            )}
                        </Space>
                    </Card>

                    <Card title="Агент" className={styles.agentCard}>
                        <div className={styles.agentInfo}>
                            <UserOutlined className={styles.agentIcon} />
                            <div>
                                <Text strong>{apartment.created_by?.full_name ?? "Не указано"}</Text>
                                <br />
                                <Text type="secondary">{apartment.created_by?.email ?? "-"}</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className={styles.metaCard}>
                        <Space direction="vertical" size="small">
                            <div className={styles.metaItem}>
                                <CalendarOutlined />
                                <Text type="secondary">
                                    Создано: {apartment.created_at ? formatDate(apartment.created_at) : "-"}
                                </Text>
                            </div>
                            <div className={styles.metaItem}>
                                <CalendarOutlined />
                                <Text type="secondary">
                                    Обновлено: {apartment.updated_at ? formatDate(apartment.updated_at) : "-"}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ApartmentDetail;
