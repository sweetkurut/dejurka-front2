import React, { useState } from "react";
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, message, Popconfirm, Typography } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    FireOutlined,
} from "@ant-design/icons";

import { Directory } from "../../types";
import styles from "./Directories.module.scss";
import {
    useCreateDirectoryMutation,
    useDeleteDirectoryMutation,
    useGetDirectoriesQuery,
    useUpdateDirectoryMutation,
} from "@/api/directoriesApi";
import dayjs from "dayjs";

const { Title } = Typography;
const { TabPane } = Tabs;

const Directories: React.FC = () => {
    const [activeTab, setActiveTab] = useState("series");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDirectory, setEditingDirectory] = useState<Directory | null>(null);
    const [form] = Form.useForm();

    const { data: directories = [], isLoading } = useGetDirectoriesQuery(activeTab);
    console.log("Active tab:", activeTab);
    const [createDirectory, { isLoading: isCreating }] = useCreateDirectoryMutation();
    const [updateDirectory, { isLoading: isUpdating }] = useUpdateDirectoryMutation();
    const [deleteDirectory] = useDeleteDirectoryMutation();

    const directoryTypes = [
        { key: "series", label: "Серии домов", icon: <HomeOutlined /> },
        { key: "roomcount", label: "Комнаты", icon: <FireOutlined /> },
        { key: "renovationtype", label: "Тип ремонта", icon: <EnvironmentOutlined /> },
        { key: "document", label: "Документы", icon: <FileTextOutlined /> },
        { key: "heatingtype", label: "Отопление", icon: <FireOutlined /> },
        { key: "furnituretype", label: "Мебель", icon: <HomeOutlined /> },
        { key: "district", label: "Районы", icon: <EnvironmentOutlined /> },
    ];

    const columns = [
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Дата создания",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 120,
            render: (_, record: Directory) => (
                <Space size="small">
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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
            ),
        },
    ];

    const handleAdd = () => {
        setEditingDirectory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (directory: Directory) => {
        setEditingDirectory(directory);
        form.setFieldsValue(directory);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDirectory({ type: activeTab, id }).unwrap();
            message.success("Запись удалена");
        } catch (error) {
            message.error("Ошибка при удалении");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = { ...values, type: activeTab };

            if (editingDirectory) {
                await updateDirectory({ type: activeTab, id: editingDirectory.id, data }).unwrap();
                message.success("Запись обновлена");
            } else {
                await createDirectory({ type: activeTab, data }).unwrap();
                message.success("Запись создана");
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error("Ошибка при сохранении");
        }
    };

    const getCurrentTypeLabel = () => {
        const type = directoryTypes.find((t) => t.key === activeTab);
        return type?.label || "";
    };

    return (
        <div className={styles.directories}>
            <div className={styles.header}>
                <Title level={2}>Справочники</Title>
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Добавить
                        </Button>
                    }
                >
                    {directoryTypes.map((type) => (
                        <TabPane
                            tab={
                                <span>
                                    {type.icon}
                                    {type.label}
                                </span>
                            }
                            key={type.key}
                        >
                            <Table
                                columns={columns}
                                dataSource={directories}
                                rowKey="id"
                                loading={isLoading}
                                pagination={{
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} из ${total} записей`,
                                }}
                            />
                        </TabPane>
                    ))}
                </Tabs>
            </Card>

            <Modal
                title={`${editingDirectory ? "Редактировать" : "Добавить"} - ${getCurrentTypeLabel()}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <Form.Item
                        name="name"
                        label="Название"
                        rules={[{ required: true, message: "Введите название" }]}
                    >
                        <Input placeholder="Название записи" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                                {editingDirectory ? "Обновить" : "Создать"}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Отмена</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Directories;
