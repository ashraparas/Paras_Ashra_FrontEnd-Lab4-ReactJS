import { useState, useEffect, useRef, FormEvent } from 'react';
import { getItems, addItem } from '../service/item';
import { Spinner, Alert, Container, Table, Button, Modal, Form } from 'react-bootstrap';
import IItem from '../model/IItem';

const ExpenseTracker = () => {
    const [items, setItems] = useState<IItem[]>([] as IItem[]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);


    //1.intiate backend call after first render
    useEffect(() => {

        const fetchItems = async () => {
            try {
                const items = await getItems();
                console.log(items);
                setItems(items);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }

        };

        fetchItems();

    }, []);

    const totalByPayee = (payeeName: string) => {
        // EXERCISE: You can convert this logic to use reduce()
        let total = 0;

        for (let i = 0; i < items.length; i++) {
            if (items[i].payeeName === payeeName) {
                total += items[i].price;
            }
        }

        return total;
    };

    const AmountToPayBy = (payeeName1: string, payeeName2: string) => {

        let totalByPayeeName1 = totalByPayee(payeeName1);
        let totalByPayeeName2 = totalByPayee(payeeName2);

        if (totalByPayeeName1 > totalByPayeeName2) {
            return (`${payeeName2} Has to pay Amount to ${payeeName1}`);
        }
        else {
            return (`${payeeName1} Has to pay Amount to ${payeeName2}`);
        }



    };

    const AmountToPay = (payeeName1: string, payeeName2: string) => {

        let totalByPayee1 = totalByPayee(payeeName1);
        let totalByPayee2 = totalByPayee(payeeName2);
        let AmountToPay = 0;
        let halfAmount = 0;

        halfAmount = ((totalByPayee1 + totalByPayee2) / 2);
        if (totalByPayee1 > halfAmount && totalByPayee2 < halfAmount) {
            AmountToPay = (halfAmount - totalByPayee2);
        }
        else {
            AmountToPay = (halfAmount - totalByPayee1);
        }

        return AmountToPay;


    };



    const [show, setShow] = useState<boolean>(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const payeeNameRef = useRef<HTMLSelectElement>(null);
    const productRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);


    const addExpense = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // EXERCISE: Create and setup refs for rest 2 inputs, and add to this object
        const expense = {
            payeeName: payeeNameRef?.current?.value as string,
            product: productRef?.current?.value as string,
            price: parseFloat(priceRef?.current?.value as string) as number,
            setDate: "2022-07-11" as String
        } as Omit<IItem, 'id'>;

        console.log(expense);


        const updatedItem = await addItem(expense);

        setItems([
            ...items,
            updatedItem
        ]);

        handleClose();
    }
    return (
        <Container className="my-4" >

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add an expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addExpense}>
                        <Form.Group className="mb-3" controlId="payeeName">
                            <Form.Label>Who paid?</Form.Label>
                            <Form.Select aria-label="Payee name" ref={payeeNameRef}>
                                <option>-- Select payee --</option>
                                <option value="Rahul">Rahul</option>
                                <option value="Ramesh">Ramesh</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="product"
                        >
                            <Form.Label>For what?</Form.Label>
                            <Form.Control
                                type="text"
                                ref={productRef}
                            />
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="price"
                        >
                            <Form.Label>How much?</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                ref={priceRef}
                            />
                        </Form.Group>

                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Add expense
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <h1>
                Expense Tracker
                <Button variant="primary" className="float-end" onClick={handleShow}>
                    Add expense
                </Button>
            </h1>
            <hr />
            {
                loading && (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )
            }
            {
                !loading && error && (
                    <Alert variant="danger">{error.message}</Alert>
                )
            }
            {
                !loading && !error && (
                    <Table className="table-responsive" >
                        <thead>
                            <tr>
                                <th>Sr</th>
                                <th>Payee</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th className="text-end">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td>{idx + 1}</td>
                                    <td>{item.payeeName}</td>
                                    <td>{item.product}</td>
                                    <td>{item.setDate}</td>
                                    <td className="font-monospace text-end">
                                        {item.price}
                                    </td>
                                </tr>
                            ))}



                            <tr>
                                <td colSpan={4} className="text-end">
                                    Total Expenses:
                                </td>
                                <td className="font-monospace text-end">
                                    {totalByPayee("Rahul") + totalByPayee("Ramesh")}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="text-end">
                                    Rahul paid
                                </td>
                                <td className="font-monospace text-end">
                                    {totalByPayee("Rahul")}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="text-end">
                                    Ramesh paid
                                </td>
                                <td className="font-monospace text-end">
                                    {totalByPayee("Ramesh")}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="text-end">
                                    {AmountToPayBy("Rahul", "Ramesh")}
                                </td>
                                <td className="font-monospace text-end">
                                    {AmountToPay("Rahul", "Ramesh")}
                                </td>
                            </tr>

                        </tbody>
                    </Table>

                )}
        </Container>



    );

};

export default ExpenseTracker;