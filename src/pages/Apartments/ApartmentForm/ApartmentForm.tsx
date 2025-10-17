import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Switch, Upload, Button, Card, Row, Col, message } from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    useCreateApartmentMutation,
    useGetApartmentQuery,
    useUpdateApartmentMutation,
} from "@/api/apartmentsApi";
import { useGetDirectoriesQuery } from "@/api/directoriesApi";

const { TextArea } = Input;
const { Option } = Select;

const ApartmentForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const isEditing = !!id;

    const [form] = Form.useForm();
    const [selectedSeries, setSelectedSeries] = useState<string>("");

    const { data: apartment } = useGetApartmentQuery(id!, { skip: !isEditing });
    const { data: series = [] } = useGetDirectoriesQuery("series");
    const { data: districts = [] } = useGetDirectoriesQuery("district");
    const { data: documents = [] } = useGetDirectoriesQuery("document");
    const { data: heating = [] } = useGetDirectoriesQuery("heating");

    const [createApartment, { isLoading: isCreating }] = useCreateApartmentMutation();
    const [updateApartment, { isLoading: isUpdating }] = useUpdateApartmentMutation();

    useEffect(() => {
        if (apartment) {
            // Проверяем права доступа для редактирования
            if (user?.role === "agent" && apartment.userId !== user.id) {
                message.error("У вас нет прав для редактирования этого объекта");
                navigate("/apartments");
                return;
            }
            form.setFieldsValue(apartment);
            setSelectedSeries(apartment.series);
        }
    }, [apartment, form, user, navigate]);

    const onFinish = async (values: any) => {
        try {
            if (isEditing) {
                await updateApartment({ id: id!, data: values }).unwrap();
                message.success("Объект успешно обновлен");
            } else {
                await createApartment(values).unwrap();
                message.success("Объект успешно создан");
            }
            navigate("/apartments");
        } catch (error) {
            message.error("Произошла ошибка при сохранении");
        }
    };

    const handleSeriesChange = (value: string) => {
        setSelectedSeries(value);
        // Сбрасываем поля, которые зависят от серии
        form.setFieldsValue({
            buildingCompany: undefined,
            residentialComplex: undefined,
            section: undefined,
        });
    };

    const isElite = selectedSeries === "Элитка";

    const repairOptions = [
        { value: "designer", label: "Дизайнерский" },
        { value: "euro", label: "Евроремонт" },
        { value: "good", label: "Хорошее состояние" },
        { value: "cosmetic", label: "Косметика" },
        { value: "pso", label: "ПСО" },
        { value: "old", label: "Старый ремонт" },
    ];

    const furnitureOptions = [
        { value: "full", label: "Полностью меблированная" },
        { value: "partial", label: "Частично меблированная" },
        { value: "none", label: "Без мебели" },
    ];

    return (
        <Card title={isEditing ? "Редактировать объект" : "Добавить объект"}>
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="series"
                            label="Серия"
                            rules={[{ required: true, message: "Выберите серию" }]}
                        >
                            <Select placeholder="Выберите серию" onChange={handleSeriesChange}>
                                {series.map((item) => (
                                    <Option key={item.id} value={item.name}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="district"
                            label="Район"
                            rules={[{ required: true, message: "Выберите район" }]}
                        >
                            <Select placeholder="Выберите район">
                                {districts.map((item) => (
                                    <Option key={item.id} value={item.name}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {isElite && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="buildingCompany"
                                label="Строительная компания"
                                rules={[{ required: true, message: "Введите строительную компанию" }]}
                            >
                                <Input placeholder="Название строительной компании" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="residentialComplex"
                                label="Жилой комплекс"
                                rules={[{ required: true, message: "Введите название ЖК" }]}
                            >
                                <Input placeholder="Название ЖК" />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                {!isElite && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="section"
                                label="Расположение"
                                rules={[{ required: true, message: "Выберите расположение" }]}
                            >
                                <Select placeholder="Выберите расположение">
                                    <Option value="corner">Угловая</Option>
                                    <Option value="not-corner">Не угловая</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="repair"
                            label="Ремонт"
                            rules={[{ required: true, message: "Выберите состояние ремонта" }]}
                        >
                            <Select placeholder="Выберите состояние ремонта">
                                {repairOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="rooms"
                            label="Количество комнат"
                            rules={[{ required: true, message: "Выберите количество комнат" }]}
                        >
                            <Select placeholder="Количество комнат">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <Option key={num} value={num}>
                                        {num} комн.
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="address"
                    label="Адрес"
                    rules={[{ required: true, message: "Введите адрес" }]}
                >
                    <Input placeholder="Полный адрес объекта" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="totalArea"
                            label="Общая площадь (м²)"
                            rules={[{ required: true, message: "Введите общую площадь" }]}
                        >
                            <InputNumber placeholder="Площадь" min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="floor"
                            label="Этаж"
                            rules={[{ required: true, message: "Введите этаж" }]}
                        >
                            <InputNumber placeholder="Этаж" min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="totalFloors"
                            label="Этажность"
                            rules={[{ required: true, message: "Введите этажность" }]}
                        >
                            <InputNumber
                                placeholder="Общее количество этажей"
                                min={1}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="isBasement" valuePropName="checked">
                            <Switch /> Цокольный этаж
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="isPenthouse" valuePropName="checked">
                            <Switch /> Пентхаус
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="documents" label="Документы">
                            <Select mode="multiple" placeholder="Выберите документы" allowClear>
                                {documents.map((item) => (
                                    <Option key={item.id} value={item.name}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="heating"
                            label="Отопление"
                            rules={[{ required: true, message: "Выберите тип отопления" }]}
                        >
                            <Select placeholder="Выберите тип отопления">
                                {heating.map((item) => (
                                    <Option key={item.id} value={item.name}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="furniture" label="Мебель">
                    <Select placeholder="Выберите наличие мебели">
                        {furnitureOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="description" label="Описание">
                    <TextArea rows={4} placeholder="Дополнительная информация об объекте" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label="Цена"
                            rules={[{ required: true, message: "Введите цену" }]}
                        >
                            <InputNumber
                                placeholder="Цена в рублях"
                                min={0}
                                style={{ width: "100%" }}
                                formatter={(value) => `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            />
                        </Form.Item>
                    </Col>

                    {user?.role === "admin" && (
                        <Col span={12}>
                            <Form.Item name="priceNet" label="Цена «на руки»">
                                <InputNumber
                                    placeholder="Цена для агента"
                                    min={0}
                                    style={{ width: "100%" }}
                                    formatter={(value) => `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Form.Item name="photos" label="Фотографии">
                    <Upload multiple listType="picture-card" beforeUpload={() => false}>
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Загрузить</div>
                        </div>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Row gutter={16}>
                        <Col>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={isCreating || isUpdating}
                            >
                                {isEditing ? "Обновить" : "Создать"}
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={() => navigate("/apartments")}>Отмена</Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ApartmentForm;
