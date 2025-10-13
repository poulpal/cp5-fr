import { useEffect, useState } from 'react'
import { Row, Col, Card, CardBody, CardText, Badge, ListGroup, ListGroupItem, Button } from 'reactstrap'
import { Check, Star, Briefcase, Plus } from 'react-feather'
import api from '../configs/apiConfig'
import PriceFormat from '../components/PriceFormat'

const Pricing = () => {
    const [plans, setPlans] = useState([])
    const [coreModules, setCoreModules] = useState([])
    const [paidModules, setPaidModules] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [plansRes, modulesRes] = await Promise.all([
                    api.get('/public/plans'),
                    api.get('/public/modules')
                ])
                setPlans(plansRes.data.data)
                setCoreModules(modulesRes.data.data.filter(m => m.is_core))
                setPaidModules(modulesRes.data.data.filter(m => !m.is_core))
            } catch (error) {
                console.error("Error fetching pricing data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const planIcons = {
        0: <Briefcase size={20} />,
        1: <Star size={20} />,
        2: <Briefcase size={20} />
    }
    const planColors = {
        0: 'primary',
        1: 'success',
        2: 'warning'
    }


    return (
        <div>
            <div className='text-center'>
                <h1>پکیج‌ها و قیمت‌گذاری</h1>
                <p>پلن متناسب با نیاز خود را انتخاب کنید</p>
            </div>

            <Row className='pricing-card'>
                <Col className='mx-auto' md={10} lg={12}>
                    <Row>
                        {plans.map((plan, index) => (
                            <Col key={plan.id} md={4}>
                                <Card className='text-center'>
                                    <CardBody>
                                        <div className={`avatar bg-light-${planColors[index]} p-50 m-auto mb-1`}>
                                            {planIcons[index]}
                                        </div>
                                        <h3>{plan.name}</h3>
                                        <CardText>{plan.title}</CardText>

                                        <div className='annual-plan'>
                                            <div className='plan-price mt-2'>
                                                <sup className='font-medium-1 fw-bold text-primary'>تومان</sup>
                                                <span className={`pricing-value fw-bolder text-primary`}>
                                                    <PriceFormat amount={plan.price} />
                                                </span>
                                                <sub className='pricing-duration text-body font-medium-1 fw-bold'>/سالیانه</sub>
                                            </div>
                                        </div>

                                        <ListGroup flush className='my-2'>
                                            <ListGroupItem>
                                                <strong>{plan.max_units < 100 ? `تا ${plan.max_units}` : 'بدون محدودیت'}</strong> واحد
                                            </ListGroupItem>
                                            <ListGroupItem>
                                                تا <strong>{plan.max_managers}</strong> مدیر
                                            </ListGroupItem>
                                        </ListGroup>

                                        <Button.Ripple color={planColors[index]} block>
                                            شروع کنید
                                        </Button.Ripple>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>

            <div className='text-center mt-5'>
                <h2>ویژگی‌های اصلی (رایگان در تمام پکیج‌ها)</h2>
                <p>تمام امکانات زیر به صورت پیش‌فرض در پکیج شما فعال است.</p>
            </div>
            <Row className='justify-content-center'>
                {coreModules.map(module => (
                    <Col md={3} key={module.id}>
                        <Card>
                            <CardBody className='text-center'>
                                <Check className='text-success' size={40} />
                                <h4 className='mt-1'>{module.title}</h4>
                                <p>{module.description}</p>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>


            <div className='text-center mt-5'>
                <h2>ماژول‌های افزودنی (اختیاری)</h2>
                <p>قابلیت‌های حرفه‌ای را بر اساس نیاز به پکیج خود اضافه کنید.</p>
            </div>
            <Row className='justify-content-center'>
                {paidModules.map(module => (
                    <Col md={3} key={module.id}>
                        <Card>
                            <CardBody className='text-center'>
                                <Plus className='text-primary' size={40} />
                                <h4 className='mt-1'>{module.title}</h4>
                                <p>{module.description}</p>
                                <Badge color='light-primary'>
                                    <PriceFormat amount={module.price} /> تومان
                                </Badge>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    )
}

export default Pricing