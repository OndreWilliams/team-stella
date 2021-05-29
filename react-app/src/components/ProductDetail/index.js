import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOneProduct, getAllProducts, getProductGroup } from '../../store/products';
import { getProductReviews, newReview , changeReview} from '../../store/reviews'
import { addCartItem } from '../../store/cart'
import ReviewCard from './ReviewCard'
import StarSpan from './StarSpan'
import './ProductDetail.css';

const ProductDetail = () => {
    const [addReview, setAddReview] = useState(false);
    const [editReview, setEditReview] = useState(false);
    const [reviewId, setReviewId] = useState(null)
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(3);

    const dispatch = useDispatch();

    const { id } = useParams();
    //**********************************
    const cartObj = useSelector(state => state.cart);
    const cartItemIds = Object.keys(cartObj);
    const storedProducts = useSelector(state => Object.keys(state.products));
    const productsNeeded = cartItemIds.filter((itemId) => !storedProducts.includes(itemId));
    if (productsNeeded.length > 0) {
        let group = `${productsNeeded[0]},${id}`;

        for (let i = 1; i < productsNeeded.length; i++) {
            group += `,${productsNeeded[i]}`;
        }

        dispatch(getProductGroup(group));
    }

    //**********************************
    const product = useSelector(state => state.products[id]);

    useEffect(() => {
        dispatch(getProductReviews(id));
    }, [dispatch, id]);

    const reviews = useSelector(state => state.reviews.detail);
    const currentUser = useSelector(state => state.session.user);

    const reviewedAlready = reviews.some((review) => review.user.id == currentUser.id)
    

    // JB: Sorts Reviews so that users review is up top
    reviews.sort(function (x, y) {
        return x.user.id == currentUser.id ? -1 :
            y.user.id == currentUser.id ? 1 : 0
    });

    // window.scrollTo(0,0);



    if (!product) {
        return null;
    }

    const openAddReview = (e) => {
        e.preventDefault();
        setAddReview(true);
        
    }

    const submitComment = (e) => {
        e.preventDefault();
        //Send to db
        if (editReview) dispatch(changeReview(reviewId, review, rating))
        else dispatch(newReview(id, review, rating));
        setReview('');
        setAddReview(false);
        setEditReview(false);
    }

    let reviewSection = (
        <>
            {reviews && reviews.map((review, i) => {
                const reviewUser = review.user
                return (
                    <ReviewCard
                        key={i}
                        setReview={setReview}
                        setRating={setRating}
                        setReviewId={setReviewId}
                        editReview={editReview}
                        setEditReview={setEditReview}
                        setAddReview={setAddReview}
                        rvwId={review.id}
                        user={reviewUser}
                        desc={review.review}
                        rating={review.rating}
                        showEdit={currentUser.id === reviewUser.id} />
                )
            })}
        </>
    )

    let addReviewSection //= (<button onClick={openAddReview} className='pdt-dtl_add-review-button'>Add Review</button>);

    if (!addReview) {
        if (reviewedAlready) {
            addReviewSection = null
        } else {
            addReviewSection = <button onClick={openAddReview} className='pdt-dtl_add-review-button'>Add Review</button>;
        }
    } else {
        addReviewSection = (
            <form className='pdt-dtl_add-review-form' onSubmit={submitComment}>
                {/* <input
                        type='text'
                        className='pdt-dtl_add-review-form'
                        placeholder='Add title here'
                        /> */}
                {editReview && <p>Edit your review:</p>}
                <textarea
                    className='pdt-dtl_add-review-textarea'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder='Add review here' />
                <StarSpan mutable={true} rating={rating} setRating={setRating} />
                <div className='review-form_btn-row'>
                    <button className='review-form_submit-btn' type='submit'>Submit Review</button>
                    <button className='review-form_cancel-btn'
                        onClick={() => {
                            setAddReview(false);
                            setEditReview(false);
                            setRating(5);
                        }}>Cancel</button>
                </div>
            </form>
        )
    }

    // const product = {
    //     id: 1,
    //     name: 'Replica Monster Energy Yamaha Team 2021 T-shirt',
    //     price: 56.00,
    //     description: 'Official replica of the polo shirt that will be worn by the Yamaha Monster Energy Team and its official riders: the Spanish Maverick Viñales and the Frenchman Fabio Quartararo in the 2021 season. It is made of technical fabric.',
    //     image: 'https://res.cloudinary.com/dpf7crjn5/image/upload/v1621893530/test%20data/teamMonsterShirt_d1mhot.jpg',
    // }

    const onPurchase = () => {
        dispatch(addCartItem(product));
    };

    const showHideDesc = (infoClass, arrowClass, buttonClass) => {
        let chev = document.querySelector(arrowClass);
        let btn = document.querySelector(buttonClass);

        if (document.querySelector(infoClass).style.display !== "block") {
            document.querySelector(infoClass).style.display = "block";
            btn.scrollIntoView({behavior: "smooth"});
            chev.style.transform = "rotate(180deg)";
            btn.style.borderBottom = "none";
        }
        else {
            document.querySelector(infoClass).style.display = "none";
            chev.style.transform = "rotate(-360deg)";
            btn.style.borderBottom = "1px solid darkgray"
        }
    }

    return (
        <div className="pdt-dtl__cntnr">
            <div className="pdt-dtl__display">
                <div className="pdt-dtl__img-cntnr">
                    <img className="pdt-dtl__img" src={product.image} alt="Product " />
                </div>
                <div className="pdt-dtl__main-info">
                    <div className="pdt-dtl__name">{product.name}</div>
                    <div className="pdt-dtl__label">Price</div>
                    <div className="pdt-dtl__price">{`$${product.price.toFixed(2)}`}</div>
                    <div className="pdt-dtl__stock">In stock now!</div>
                    <div className="pdt-dtl__policies">
                        <p>Free shipping</p>
                        <p>Free returns</p>
                        <p>Secure payments</p>
                    </div>
                    <button onClick={onPurchase} className="pdt-dtl__add-to-cart">
                        Add to cart
                    </button>
                    <button className="pdt-dtl__buy-it-now">
                        Buy it now
                    </button>
                    <div className="pdt-dtl__shipping-time">
                        Ships in 1-3 business days
                    </div>
                </div>
            </div>
            <div className="pdt-dtl__xtra-info">
                <button onClick={() => showHideDesc(".pdt-dtl__desc", ".pdt-dtl__desc-chevron", ".desc-btn")} className="pdt-dtl__xtra-info-btn desc-btn">
                    <span className="pdt-dtl__xtra-info-title">Description</span>
                    <i className="fas fa-chevron-down pdt-dtl__desc-chevron"></i>
                </button>
                <div className="pdt-dtl__desc">{product.description}</div>
                <button onClick={() => showHideDesc(".pdt-dtl__reviews", ".pdt-dtl__reviews-chevron", ".reviews-btn")} className="pdt-dtl__xtra-info-btn reviews-btn">
                    <span className="pdt-dtl__xtra-info-title">Reviews</span>
                    <i className="fas fa-chevron-down pdt-dtl__reviews-chevron"></i>
                </button>
                <div className="pdt-dtl__reviews">
                    <div className="pdt-dtl__review-container">
                        {addReviewSection}
                        {reviewSection}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductDetail;
