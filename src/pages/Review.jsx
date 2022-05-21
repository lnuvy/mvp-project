import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { history } from "../redux/configureStore";
// components
import { Grid, Wrap } from "../elements";
import { ReviewCard, Category } from "../components/index";
// moduels
import { getReviewData, getReviewDB } from "../redux/modules/reviews";
import { Apis } from "../shared/api";
const Review = () => {
  const dispatch = useDispatch();

  // const reviewList = useSelector((state) => state.review.list);
  const filteringList = useSelector((state) => state.review.filterList);

  function clickCard(reviewId) {
    history.push(`/review/view/${reviewId}`);
  }
  const [reviewList, setreviewList] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  // const PAGE_LIMIT = 50;

  const getReviewList = () => {
    setIsLoading(true);
    Apis.getReview(pageNumber)
      .then((response) => {
        console.log("서버에서 받은 데이터", response.data.reviews);
        setIsLoading(false);
        setreviewList((items) => [...items, ...response.data.reviews]);
        // setHasMore(pageNumber !== PAGE_LIMIT);
      })
      .catch((error) => console.warn(error));
  };

  useEffect(() => {
    getReviewList();
  }, [pageNumber]);

  const onIntersect = (entries) => {
    entries.forEach((element) => {
      if (element.isIntersecting) {
        setPageNumber((prev) => prev + 1);
      }
    });
  };
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.25,
    };

    const observer = new IntersectionObserver(onIntersect, options);
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loader]);

  useEffect(() => {
    // reset
    dispatch(getReviewData([]));
    // get
    // dispatch(getReviewDB());
  }, []);

  return (
    <>
      <Grid>
        <Category review />
        <Wrap margin="16px">
          <Grid gtc="1fr 1fr" margin="0 0 20px">
            {filteringList &&
              reviewList.map((v, i) => {
                // console.log(v.images);
                return (
                  <ReviewCard
                    _key={i}
                    onClick={() => clickCard(v.reviewId)}
                    {...v}
                    images={v.images[0].imageUrl || null}
                  />
                );
              })}
          </Grid>
          <div ref={loader} className="loader">
            {isLoading && "정보를 불러오는 중입니다..."}
          </div>
        </Wrap>
      </Grid>
    </>
  );
};

export default Review;
