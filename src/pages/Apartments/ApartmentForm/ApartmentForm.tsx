/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const { data: heating = [] } = useGetDirectoriesQuery("heatingtype");
    const { data: furnituretype = [] } = useGetDirectoriesQuery("furnituretype");
    const { data: roomcount = [] } = useGetDirectoriesQuery("roomcount");
    const { data: renovationtype = [] } = useGetDirectoriesQuery("renovationtype");

    const [createApartment, { isLoading: isCreating }] = useCreateApartmentMutation();
    const [updateApartment, { isLoading: isUpdating }] = useUpdateApartmentMutation();

    useEffect(() => {
        if (apartment) {
            // Проверяем права доступа для редактирования
            if (user?.role === "agent" && apartment.created_by?.id !== user.id) {
                message.error("У вас нет прав для редактирования этого объекта");
                navigate("/apartments");
            }

            form.setFieldsValue({
                series: apartment.series?.id ?? undefined,
                district: apartment.district?.id ?? undefined,
                roomcount: apartment.rooms_count?.id ?? undefined,
                renovationtype: apartment.renovation_type?.id ?? undefined,
                furnituretype: apartment.furniture?.id ?? undefined,
                heating: apartment.heating_type?.id ?? undefined,
                documents: apartment.documents?.map((d: any) => d.id) ?? [],
                buildingCompany: apartment.buildingCompany ?? undefined,
                residentialComplex: apartment.residentialComplex ?? undefined,
                section: apartment.corner_type ?? undefined,
                totalArea: apartment.area_total ?? undefined,
                floor: apartment.floor_type ? Number(apartment.floor_type) : undefined,
                totalFloors: apartment.totalFloors ?? undefined,
                isBasement: apartment.isBasement ?? false,
                isPenthouse: apartment.isPenthouse ?? false,
                address: apartment.address ?? "",
                description: apartment.description ?? "",
                price: apartment.price_visible ?? 0,
                priceNet: apartment.price_hidden ?? 0,
                photos: apartment.photos?.map((p: any) => ({ name: p, url: p })) ?? [],
            });

            setSelectedSeries(apartment.series?.name ?? "");
        }
    }, [apartment, form, user, navigate]);

    const onFinish = async (values: any) => {
        const payload = {
            seriesId: values.series ?? "",
            districtId: values.district ?? "",
            renovationTypeId: values.renovationtype ?? "",
            roomsCountId: values.roomcount ?? "",
            heatingTypeId: values.heating ?? "",
            furnitureId: values.furnituretype ?? "",
            documentsIds: values.documents?.length ? values.documents : [],
            area_total: values.totalArea,
            floor_type: values.floor?.toString() ?? "",
            corner_type: values.section ?? null,
            address: values.address ?? "",
            description: values.description ?? "",
            price_visible: values.price ?? 0,
            price_hidden: user?.role === "admin" ? values.priceNet ?? 0 : 0,
            photos:
                Array.isArray(values.photos) && values.photos.length
                    ? values.photos.map((f: any) => f.name)
                    : [],
        };

        try {
            if (isEditing) {
                await updateApartment({ id: id!, data: payload }).unwrap();
            } else {
                await createApartment(payload).unwrap();
            }
            message.success("Успешно сохранено");
            navigate("/apartments");
        } catch {
            message.error("Ошибка сохранения");
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

    // const repairOptions = [
    //     { value: "designer", label: "Дизайнерский" },
    //     { value: "euro", label: "Евроремонт" },
    //     { value: "good", label: "Хорошее состояние" },
    //     { value: "cosmetic", label: "Косметика" },
    //     { value: "pso", label: "ПСО" },
    //     { value: "old", label: "Старый ремонт" },
    // ];

    // const furnitureOptions = [
    //     { value: "full", label: "Полностью меблированная" },
    //     { value: "partial", label: "Частично меблированная" },
    //     { value: "none", label: "Без мебели" },
    // ];

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

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
                                    <Option key={item.id} value={item.id}>
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
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* {isElite && (
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
                )} */}

                {!isElite && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="section"
                                label="Расположение"
                                rules={[{ required: true, message: "Выберите расположение" }]}
                            >
                                <Select placeholder="Выберите расположение">
                                    <Option value="угловая">Угловая</Option>
                                    <Option value="не угловая">Не угловая</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="renovationtype"
                            label="Ремонт"
                            rules={[{ required: true, message: "Выберите состояние ремонта" }]}
                        >
                            <Select placeholder="Выберите состояние ремонта">
                                {renovationtype.map((option) => (
                                    <Option key={option.id} value={option.id}>
                                        {option.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="roomcount"
                            label="Количество комнат"
                            rules={[{ required: true, message: "Выберите количество комнат" }]}
                        >
                            <Select placeholder="Количество комнат">
                                {roomcount.map((option) => (
                                    <Option key={option.id} value={option.id}>
                                        {option.name}
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
                                    <Option key={item.id} value={item.id}>
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
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="furnituretype" label="Мебель">
                    <Select placeholder="Выберите наличие мебели">
                        {furnituretype.map((option) => (
                            <Option key={option.id} value={option.id}>
                                {option.name}
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

                <Form.Item
                    name="photos"
                    label="Фотографии"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
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
