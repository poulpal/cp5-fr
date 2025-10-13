import { useEffect, useState } from 'react'
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Button, Spinner, Badge } from 'reactstrap'
import { CheckCircle, ShoppingCart } from 'react-feather'
import api from '../../configs/apiConfig'
import BuyModuleModal from '../../components/buildingManager/modules/buyModuleModal'
import PriceFormat from '../../components/PriceFormat'

const Modules = () => {
    const [modules, setModules] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [selectedModule, setSelectedModule] = useState(null)

    const fetchModules = async () => {
        setIsLoading(true)
        try {
            // This API endpoint fetches all entries from the modules table
            const res = await api.get('/building-manager/modules') 
            setModules(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchModules()
    }, [])

    const handleBuyClick = (module) => {
        setSelectedModule(module)
        setModalIsOpen(true)
    }

    // *** THIS IS THE CORRECTED LOGIC ***
    // Filter modules based on the 'type' field from the seeder
    const coreModules = modules.filter(m => m.type === 'core_module')
    const paidModules = modules.filter(m => m.type === 'addon')

    return (
        <div>
            {/* Section for Core (Free) Modules */}
            <Card>
                <CardHeader>
                    <CardTitle tag='h4'>ماژول‌های اصلی (رایگان)</CardTitle>
                </CardHeader>
                <CardBody>
                    <p>این ماژول‌ها بخشی از پکیج پایه شما هستند و همیشه فعال می‌باشند.</p>
                    {isLoading ? <div className="text-center"><Spinner /></div> : (
                        <Row>
                            {coreModules.length > 0 ? coreModules.map(module => (
                                <Col md={4} key={module.id}>
                                    <Card className='border'>
                                        <CardBody>
                                            <h5><CheckCircle size={18} className="text-success me-1" />{module.title}</h5>
                                            <p>{module.description}</p>
                                        </CardBody>
                                    </Card>
                                </Col>
                            )) : <p>ماژول اصلی یافت نشد.</p>}
                        </Row>
                    )}
                </CardBody>
            </Card>

            {/* Section for Paid Add-on Modules */}
            <Card>
                <CardHeader>
                    <CardTitle tag='h4'>ماژول‌های افزودنی</CardTitle>
                </CardHeader>
                <CardBody>
                    <p>برای فعال‌سازی قابلیت‌های بیشتر، ماژول‌های زیر را خریداری کنید.</p>
                    {isLoading ? <div className="text-center"><Spinner /></div> : (
                        <Row>
                            {paidModules.length > 0 ? paidModules.map(module => (
                                <Col md={4} key={module.id}>
                                    <Card className='border'>
                                        <CardBody>
                                            <h5>{module.title}</h5>
                                            <p>{module.description}</p>
                                            {module.is_active ? (
                                                <Badge color='light-success' pill>فعال</Badge>
                                            ) : (
                                                <div className='d-flex justify-content-between align-items-center'>
                                                    <span><PriceFormat amount={module.price} /> تومان</span>
                                                    <Button.Ripple
                                                        color='primary'
                                                        size='sm'
                                                        onClick={() => handleBuyClick(module)}
                                                    >
                                                        <ShoppingCart size={14} /> خرید
                                                    </Button.Ripple>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Col>
                            )) : <p>ماژول افزودنی برای خرید یافت نشد.</p>}
                        </Row>
                    )}
                </CardBody>
            </Card>

            {/* Modal for purchasing */}
            {selectedModule && (
                <BuyModuleModal
                    isOpen={modalIsOpen}
                    toggle={() => setModalIsOpen(!modalIsOpen)}
                    module={selectedModule}
                    onSuccess={fetchModules}
                />
            )}
        </div>
    )
}

export default Modules