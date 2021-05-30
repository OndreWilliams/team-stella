import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import "./Navbar.css";
import usePrevious from "../../utilities/usePrevious";
import { addCartItem, removeCartItem, clearCart } from "../../store/cart";

const CartDropdown = ({cartDropdownVisible, setCartDropdownVisible, cartCloseClass, setCartCloseClass}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const cart = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products);
  // const [cartDropdownVisible, setCartDropdownVisible] = useState(false);
  // const [cartCloseClass, setCartCloseClass] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const closeCartDropdown = (e) => {
    setCartCloseClass(true);
    setTimeout(() => setCartDropdownVisible(false), 500);
  };

  const getTotalItems = (cart) =>
    Object.keys(cart).reduce((sum, itemID) => cart[itemID] + sum, 0);

  const getTotalCost = (cart, products) => {
    const costTotal = Object.keys(cart).reduce((sum, itemID) => {
      if (products[itemID]) {
        return cart[itemID] * products[itemID].price + sum;
      }
      return sum;
    }, 0);
    setTotalCost(costTotal);
  };

  const prevTotalItems = usePrevious(getTotalItems(cart));

  const addOne = (product) => {
    dispatch(addCartItem(product));
  };

  const removeOne = (product) => {
    dispatch(removeCartItem(product));
  };

  const onClickCart = (e) => {
    e.stopPropagation();
    setCartCloseClass(false);
    setCartDropdownVisible(true);
  }

  useEffect(() => {
    const totalCount = getTotalItems(cart);
    getTotalCost(cart, products);
    if (totalCount > prevTotalItems && location.pathname !== "/checkout") {
      setCartCloseClass(false);
      setCartDropdownVisible(true);
    }
  }, [cart]);

  const goToCheckout = () => {
    closeCartDropdown();
    history.push("/checkout");
  };

  const clearShoppingCart = () => {
    dispatch(clearCart());
  };

  return (
    <>
      <button onClick={(e) => onClickCart(e)} className="nav-links-btn">Cart</button>
      {cartDropdownVisible && (
        // <div
        //   className="close-cart-dropdown"
        //   onClick={(e) => closeCartDropdown(e)}
        // >
          <div
            className={
              (cartDropdownVisible ? "cart-dropdown " : "") +
              (cartCloseClass ? "cart-close" : "")
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-dropdown-item-container">
              {Object.entries(cart).map(([key, value]) => {
                return (
                  <div className="cart-dropdown-item" key={key}>
                    {`${products[key].name}`}
                    <div>
                      <button
                        style={{ padding: 6 }}
                        onClick={() => addOne(products[key])}
                        className="add-one"
                      >
                        &#8593;
                      </button>
                      <span style={{ padding: 6 }}>{value}</span>
                      <button
                        style={{ padding: 6 }}
                        onClick={() => removeOne(products[key])}
                        className="remove-one"
                      >
                        &#8595;
                      </button>
                    </div>
                    <span>{`$${(products[key].price * value).toFixed(
                      2
                    )}`}</span>
                  </div>
                );
              })}
            </div>
            <div className="total-cost-container">
              <span
                style={{
                  color: "blue",
                  padding: 4,
                }}
              >{`Total: $${totalCost.toFixed(2)}`}</span>
              <button onClick={goToCheckout}>Checkout</button>
              <button onClick={clearShoppingCart}>Clear</button>
            </div>
          </div>
        // </div>
      )}
    </>
  );
};

export default CartDropdown;
