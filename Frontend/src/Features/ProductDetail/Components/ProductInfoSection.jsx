import { FaStarHalfAlt } from "react-icons/fa";
import { PriceDetail } from "../../Common/PriceDetailTile";
import { SizeBadge } from "./SizeBadge";
import { v4 as uuid } from "uuid";
import { AddToCartButton } from "../../Common/Buttons/AddToCartButton";
import { AddToWishlistButton } from "../../Common/Buttons/AddToWishlistButton";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCartAsync, selectCartStatus } from "../../Cart/CartSlice";
import { useParams } from "react-router-dom";
import { selectLoggedInUser } from "../../Auth/AuthSlice";
import {
  selectWishlistItems,
  removeFromWishlistAsync,
  addToWishlistAsync,
} from "../../Wishlist/WishlistSlice";
import { useNavigate } from "react-router-dom";

export function ProductInfoSection({
  _id,
  title,
  brand,
  description,
  stock,
  rating,
  price,
  discountPercentage,
  variations,
}) {
  const MAX_CHAR_LIMIT = 300;
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [readMore, setReadMore] = useState(true); // for description

  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const addToCartStatus = useSelector(selectCartStatus);
  const navigate = useNavigate();

  // check if product is in wishlist
  let wishlistItems = null;
  let isProductInWishlist = false;

  if (user && user.role !== "admin") {
    wishlistItems = useSelector(selectWishlistItems);
    if (wishlistItems.length > 0) {
      isProductInWishlist = wishlistItems.find(
        (item) => item._id.toString() === _id.toString()
      );
    }
  }

  useEffect(() => {
    setSelectedColorIndex(null);
  }, [selectedProductIndex]);

  function addOrRemoveFromWishlistHandler() {
    if (isProductInWishlist) {
      dispatch(removeFromWishlistAsync({ productId: _id, navigate }));
    } else {
      dispatch(addToWishlistAsync({ productId: _id, navigate }));
    }
  }

  function addToCartHandler() {
    if (selectedProductIndex === null) {
      alert("Select size !!");
      return;
    }
    if (selectedColorIndex === null) {
      alert("Select color !!");
      return;
    }

    const productDetails = {
      productId: _id || useParams().productId,
      size: variations[selectedProductIndex].size,
      color: variations[selectedProductIndex].colors[selectedColorIndex].color,
      colorCode:
        variations[selectedProductIndex].colors[selectedColorIndex].colorCode,
      quantity: 1, //by default
    };

    dispatch(addItemToCartAsync({ productDetails, navigate }));
  }

  function truncateDescription(description, maxCharLimit = MAX_CHAR_LIMIT) {
    if (description.length < maxCharLimit) return description;
    if (readMore) {
      return description.slice(0, maxCharLimit) + " ...";
    }
    return description;
  }

  // by default select that size whose stock is available
  useEffect(() => {
    variations.find(({ size, colors }, sizeIndex) => {
      if (colors.reduce((acc, curr) => (acc += curr), 0)) {
        setSelectedProductIndex(sizeIndex);
        return true;
      }
      return false;
    });
  }, []);

  // by default select that color whose stock is available
  useEffect(() => {
    if (selectedProductIndex === null) {
      return;
    }
    const color = variations[selectedProductIndex].colors.find(
      ({ stock }, colorIndex) => {
        if (stock > 0) {
          setSelectedColorIndex(colorIndex);
          return true;
        }
        return false;
      }
    );
  }, [selectedProductIndex]);

  return (
    <>
      <div className="flex flex-col justify-start details-container w-full lg:w-[calc(100%-600px)] box-border px-8 md:pt-5 md:px-3  ">
        <div className="title font-semibold text-2xl">
          {title} by <span className="uppercase">{brand}</span>
        </div>
        <div className="description font-md text-xl text-gray-500">
          {truncateDescription(description)}
          <span
            onClick={() => setReadMore((prev) => !prev)}
            className="ml-2 text-lg  text-[#5a65e4] hover:cursor-pointer"
          >
            {description.length > MAX_CHAR_LIMIT
              ? !readMore
                ? "read less"
                : "read more"
              : ""}
          </span>
        </div>
        <div className="rating mt-4 flex flex-row ">
          <span className="text-lg">{rating}</span>
          <span className="ml-2 ">
            <FaStarHalfAlt className=" text-[#6366F1] h-5 w-5 inline-block" />
          </span>
        </div>

        <PriceDetail discountPercentage={discountPercentage} price={price} />

        {!stock ? (
          <div className="text-red-500">Out of Stock</div>
        ) : (
          <div className="mt-8 size">
            <div className="text-2xl font-bold mb-5 ">Available Sizes </div>
            <ul className="flex flex-wrap items-center gap-5 flex-row">
              {variations.map(({ size, colors }, index) => {
                const totalStockAvailable = colors.reduce(
                  (acc, curr) => (acc += curr.stock),
                  0
                );

                if (totalStockAvailable > 0) {
                  return (
                    <SizeBadge
                      key={uuid()}
                      size={size}
                      index={index}
                      setSelectedProductIndex={setSelectedProductIndex}
                      selectedProductIndex={selectedProductIndex}
                      quantity={totalStockAvailable}
                      setSelectedColorIndex={setSelectedColorIndex}
                    />
                  );
                }
              })}
            </ul>

            <div className="text-2xl font-bold my-5 ">Available Colors </div>
            <ul className="flex flex-wrap items-center gap-5 flex-row">
              {selectedProductIndex !== null &&
                variations[selectedProductIndex].colors.map(
                  ({ color, colorCode, stock }, index) => {
                    if (stock > 0) {
                      console.log(
                        { index },
                        selectedColorIndex === index,
                        typeof selectedColorIndex,
                        typeof index
                      );
                      return (
                        <div key={uuid()} className="color-wrapper">
                          <div className="color flex items-center justify-center">
                            <div
                              className={`wrapper h-10 w-10 p-[1px] rounded-full flex items-center justify-center cursor-pointer ${
                                selectedColorIndex === index &&
                                "border-2 border-[rgb(79,70,229)]"
                              }`}
                            >
                              <div
                                style={{ backgroundColor: colorCode }}
                                onClick={() => setSelectedColorIndex(index)}
                                className="h-8 w-8 rounded-full"
                              ></div>
                            </div>
                          </div>
                          <div className="text-slate-800 text-center break-words first-letter:uppercase">
                            {color}
                          </div>
                        </div>
                      );
                    }
                  }
                )}
            </ul>
          </div>
        )}

        {!user ||
          (user?.role !== "admin" && (
            <>
              <div className="mt-10 button-wrapper flex flex-wrap flex-col  gap-4">
                <div onClick={addToCartHandler} className="max-w-[400px]">
                  {stock > 0 && (
                    <AddToCartButton
                      message={
                        addToCartStatus === "loading"
                          ? "Adding to Cart"
                          : "Add to Cart"
                      }
                    />
                  )}
                </div>
                <div
                  onClick={addOrRemoveFromWishlistHandler}
                  className="max-w-[400px]"
                >
                  <AddToWishlistButton
                    message={
                      isProductInWishlist
                        ? "Remove From Wishlist"
                        : "Add To Wishlist"
                    }
                  />
                </div>
              </div>
              <span className="text-red-500">
                Max Quantity allowed per variation: 5{" "}
              </span>
            </>
          ))}
      </div>
    </>
  );
}
