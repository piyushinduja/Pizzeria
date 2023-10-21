import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'
import { findByIdAndUpdate } from '../../app/models/User'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.getElementById('cartCounter')

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then((res) => {
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false
        }).show()
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false
        }).show()
    })
}


addToCart.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})


const alertMsg = document.getElementById('success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}



// Change order status

let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)

let statuses = document.querySelectorAll('.status_line')

let time = document.createElement('small')

function updateOrder(order){
    let step_completed = true

    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })

    statuses.forEach((status)=>{
        let dataProp = status.dataset.status

        if(step_completed){
            status.classList.add('step-completed')
        }

        if(dataProp === order.status){
            step_completed = false
            time.innerText = moment(order.updatedAt).format("hh:mm A")
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateOrder(order)


// Socket
let socket = io()
initAdmin(socket)

// Join
if(order) {
    socket.emit('join', `order_${order._id}`)
}

let adminPath = window.location.pathname
if(adminPath.includes('admin')){
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateOrder(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})