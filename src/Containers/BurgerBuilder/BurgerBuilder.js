import React, { Component } from 'react';
import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions'

import Aux from '../../hoc/Aux'
import axios from '../../order-axios'
import Burger from '../../Components/Burger/Burger'
import BuildControls from '../../Components/Burger/BuildControls/BuildControls'
import Modal from '../../Components/UI/Modal/Modal'
import OrderSummary from '../../Components/Burger/OrderSummary/OrderSummary'
import Spinner from '../../Components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'

class BurgerBuilder extends Component {
    state = {
        purchasing : false,
        loading : false,
        error : false
    }
    componentDidMount(){
        console.log(this.props)
        // axios.get('https://route-burger-f38c4.firebaseio.com/ingredients.json')
        //     .then(res => {
        //         this.setState({
        //             ingredients : res.data
        //         })
        //     })
        //     .catch(error => {
        //         this.setState({
        //             error : true
        //         })
        //     })
    }
    purchaseCancelHandler = () => {
        this.setState({
            purchasing : false
        })
    }
    purchaseContinueHandler = () => {
       
        const queryParams = []
        for(let i in this.state.ingredients){
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]))
        }
        queryParams.push('price=' + this.props.price)
        const queryString = queryParams.join('&')
        this.props.history.push({
            pathname : '/checkout',
            search : '?' + queryString
        })
    }
    purchaseHandler = () => {
        this.setState({
            purchasing : true
        })
    }
    updatePurchaseState (ingredients) {
        
        const sum = Object.keys(ingredients)
            .map(igkey => {
                return ingredients[igkey]
            })
            .reduce((sum,el) => {
                return sum + el
            }, 0)

            return sum > 0
    }
    

    render() {
        const disabledInfo = {
            ...this.props.ing 
        }
        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary = null
       
        let burger = this.state.error ? <p>ingredients can't be loaded</p> : <Spinner/>
        if(this.props.ing){
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ing} />
                    <BuildControls 
                    addedIngredients={this.props.onIngredientAdded}
                    removedIngredients={this.props.onIngredientRemoved}
                    disabled={disabledInfo}
                    purchasable={this.updatePurchaseState(this.props.ing)}
                    price={this.props.price}
                    ordered={this.purchaseHandler} />
                </Aux>
            )
            orderSummary = <OrderSummary 
            price={this.props.price}
            continued={this.purchaseContinueHandler}
            Canceled={this.purchaseCancelHandler}
            ingredients={this.props.ing} />
        }
        if(this.state.loading){
            orderSummary = <Spinner/>
        }
        return (
            <Aux>
                <Modal 
                modalClosed={this.purchaseCancelHandler}
                show={this.state.purchasing}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        ing : state.ingredients,
        price : state.totalPrice
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded : (ingName) => dispatch({ type : actionTypes.ADD_INGREDIENT, ingredientName : ingName }),
        onIngredientRemoved : (ingName) => dispatch({ type : actionTypes.REMOVE_INGREDIENT, ingredientName : ingName }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));