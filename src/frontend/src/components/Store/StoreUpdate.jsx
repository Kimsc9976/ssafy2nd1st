import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import { images } from "../../assets/images";
import Swal from "sweetalert2";
import { requestPost2, requestGet, setToken } from "../../lib/api/api";

const product = ["키보드", "마우스", "헤드셋", "태블릿"];
const day = ["1일", "7일", " 14일", "30일"];

const SelectButton = ({ itemList, activeIndex, onClickHandler }) =>
  itemList.map((item, index) => (
    <SSelectProductBtn
      key={index}
      onClick={() => onClickHandler(index)}
      $activeProduct={activeIndex === index}
    >
      {item}
    </SSelectProductBtn>
  ));

const StoreUpdate = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [calendarDay, setCalendarDay] = useState(new Date());
  const [calendar, setCalendar] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { postId } = useParams();

  const initialState = {
    title: "",
    rentalFee: "",
    deposit: "",
    minRentalDay: "",
    maxRentalDay: "",
    content: "",
    productSelect: "",
    minDaySelect: "",
    maxDaySelect: "",
    year: calendarDay.getFullYear(),
    month: calendarDay.getMonth() + 1,
    date: calendarDay.getDate(),
  };
  const [state, setState] = useState(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    requestGet(`store/detail?id=${postId}`)
      .then((res) => {
        console.log(res);
        setPostData(res.data);
        if (res.data) {
          const {
            title,
            detail,
            rentalCost,
            deposit,
            minRentalPeriod,
            maxRentalPeriod,
            limitDate,
          } = res.data.storePost;

          const calendarDay = new Date(limitDate);
          const year = calendarDay.getFullYear();
          const month = (calendarDay.getMonth() + 1)
            .toString()
            .padStart(2, "0");
          const date = calendarDay.getDate().toString().padStart(2, "0");

          setState({
            title,
            productSelect: res.data.storePost.category.id - 1,
            rentalFee: rentalCost,
            deposit,
            minRentalDay: minRentalPeriod,
            maxRentalDay: maxRentalPeriod,
            content: detail,
            year,
            month,
            date,
          });
          console.log(res.data.storeImageList);
          const initialImageList = res.data.storeImageList.map(
            (imageData) => imageData.url
          );
          console.log(initialImageList)
          setImageList((prev) => [...initialImageList]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "deposit" && value.trim() === "") {
      newValue = "0";
    }
    setState((prev) => ({ ...prev, [name]: newValue }));
  };

  const selectHandler = (type, index) => {
    setState((prev) => ({ ...prev, [type]: index }));

    if (type === "minDaySelect" || type === "maxDaySelect") {
      const dayValue = day[index];
      const dayNumber = parseInt(dayValue.substring(0, dayValue.indexOf("일")));
      const dayType = type === "minDaySelect" ? "minRentalDay" : "maxRentalDay";
      setState((prev) => ({ ...prev, [dayType]: dayNumber }));
    }
  };

  const calendarHandler = () => {
    setCalendar(!calendar);
  };

  const handleDepositFocus = () => {
    if (state.deposit === "0") {
      setState((prev) => ({ ...prev, deposit: "" }));
    }
  };

  const {
    title,
    rentalFee,
    deposit,
    minRentalDay,
    maxRentalDay,
    content,
    productSelect,
    minDaySelect,
    maxDaySelect,
  } = state;

  const onDateChange = (date) => {
    setCalendarDay(date);
    setCalendar(false);
  };

  const year = calendarDay.getFullYear();
  const month = (calendarDay.getMonth() + 1).toString().padStart(2, "0");
  const date = calendarDay.getDate().toString().padStart(2, "0");

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const cors = "https://cors-anywhere.herokuapp.com/";
  async function urlsToBlobs(urls) {
    const blobs = [];
    for (let url of urls) {
      const response = await fetch(cors + url);
      const blob = await response.blob();
      blobs.push(blob);
    }
    return blobs;
  }

  useEffect(() => {
    if (imageList.length > 0 && typeof imageList[0] === "string") {
      urlsToBlobs(imageList).then((blobs) => {
        setImageList(blobs);
      });
    }
  }, [imageList]);

  const onUpload = async (e) => {
    const files = e.target.files;
    const newBlobs = [];

    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      const fileRead = new Promise((resolve) => {
        reader.onload = () => {
          resolve(reader.result);
        };
      });
      reader.readAsDataURL(files[i]);
      const fileData = await fileRead;

      const blob = dataURLtoBlob(fileData);
      newBlobs.push(blob);
    }
    setImageList((prev) => [...prev, ...newBlobs]);
  };

  const goBackBtn = () => {
    navigate("/store");
  };
  const validateForm = () => {
    return {
      isValid:
        title !== "" &&
        productSelect !== "" &&
        rentalFee !== "" &&
        minRentalDay !== "" &&
        maxRentalDay !== "" &&
        content !== "" &&
        maxRentalDay >= minRentalDay,
      errorField:
        title === ""
          ? "제목"
          : productSelect === ""
          ? "분류"
          : rentalFee === ""
          ? "대여료"
          : minRentalDay === ""
          ? "최소 대여 기간"
          : maxRentalDay === ""
          ? "최대 대여 기간"
          : content === ""
          ? "내용"
          : "최소 대여 기간은 최대 대여 기간보다 작거나 같게.",
    };
  };

  const displayMessage = (type, message) => {
    Swal.fire({
      icon: type,
      title: message,
      html: "",
      timer: 1000,
      showConfirmButton: false,
    });
  };
  const goSellBtn = () => {
    console.log({
      title,
      content,
      minRentalDay,
      maxRentalDay,
      rentalFee,
      deposit: deposit || "0",
      productSelect,
    });

    const validation = validateForm();

    if (validation.isValid) {
      setToken();

      const formData = new FormData();
      formData.append(
        "json",
        JSON.stringify({
          title: title,
          detail: content,
          minRentalPeriod: minRentalDay,
          maxRentalPeriod: maxRentalDay,
          limitDate: `${year}-${month}-${date}`,
          rentalCost: rentalFee,
          deposit: deposit,
          category: productSelect + 1,
        })
      );

      for (let i = 0; i < imageList.length; i++) {
        formData.append("multipartFile", imageList[i]);
        console.log("multipartFile", imageList[i]);
      }
      for (let pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1].type);
      }
      requestPost2(`store/update?id=${postId}`, formData)
        .then((response) => {
          displayMessage("success", "게시글 수정됨");
          console.log(response);
          navigate(`/store/${postId}`);
        })
        .catch((error) => {
          displayMessage("error", "게시글 수정에 실패하였습니다.");
        });
    } else {
      displayMessage("warning", `${validation.errorField}을(를) 입력해주세요.`);
    }
  };
  return (
    <SMain>
      <SHeader>
        <STittleAndBtn>
          <STitle>게시글 업데이트</STitle>
        </STittleAndBtn>
        <SImportantText>*필수 항목</SImportantText>
      </SHeader>
      <SSellHeader>
        <SSellHeaderPading>
          <SSubTitle>
            제목<SImportantStar>*</SImportantStar>
          </SSubTitle>
          <SSellTitleInput
            name="title"
            type="text"
            value={title}
            onChange={handleChange}
          />
        </SSellHeaderPading>
      </SSellHeader>
      <SPicture>
        <SSubTitle>
          사진 첨부<SImportantStar>*</SImportantStar>
        </SSubTitle>
        <SPictureList>
          {imageList.map((src, index) => (
            <SInsertPicture key={index} src={src} />
          ))}
          <SLabel>
            <input
              id="fileInput"
              style={{ display: "none" }}
              accept="image/*"
              multiple
              type="file"
              onChange={(e) => onUpload(e)}
            />
            <img src={images.plus} alt="Plus" />
          </SLabel>
        </SPictureList>
      </SPicture>
      <SFilterContainer>
        <SFilterDoubleBox>
          <SFilterBoxGap35>
            <SSubTitle>
              분류<SImportantStar>*</SImportantStar>
            </SSubTitle>
            <SSelectProduct>
              <SelectButton
                itemList={product}
                activeIndex={productSelect}
                onClickHandler={(index) =>
                  selectHandler("productSelect", index)
                }
              />
            </SSelectProduct>
          </SFilterBoxGap35>
          <SFilterBoxGap10>
            <SSubTitle>상한 날짜</SSubTitle>
            <SSubTitle
              onClick={calendarHandler}
            >{`${year}년 ${month}월 ${date}일`}</SSubTitle>
            {calendar && (
              <Calendar onChange={onDateChange} value={calendarDay} />
            )}
          </SFilterBoxGap10>
        </SFilterDoubleBox>
        <SFilterDoubleBox>
          <SFilterBoxGap20>
            <SSubTitle>
              대여료<SImportantStar>*</SImportantStar>
            </SSubTitle>
            <SFilterInFutAndWon>
              <SFilterInputCost
                name="rentalFee"
                type="text"
                placeholder="숫자만 입력하세요."
                value={rentalFee}
                onChange={handleChange}
              />
              <p>원</p>
            </SFilterInFutAndWon>
          </SFilterBoxGap20>
          <SFilterBoxGap20>
            <SSubTitle>보증금</SSubTitle>
            <SFilterInFutAndWon>
              <SFilterInputCost
                name="deposit"
                type="text"
                placeholder="숫자만 입력하세요."
                value={deposit}
                onChange={handleChange}
                onFocus={handleDepositFocus}
              />
              <p>원</p>
            </SFilterInFutAndWon>
          </SFilterBoxGap20>
        </SFilterDoubleBox>
        <SFilterDoubleBox>
          <SFilterBoxGap10>
            <SSubTitle>
              최소 대여 기간<SImportantStar>*</SImportantStar>
            </SSubTitle>
            <SSelectProduct>
              <SelectButton
                itemList={day}
                activeIndex={minDaySelect}
                onClickHandler={(index) => selectHandler("minDaySelect", index)}
              ></SelectButton>
            </SSelectProduct>
            <SFilterInputDay
              name="minRentalDay"
              type="text"
              placeholder="숫자만 입력하세요."
              value={minRentalDay}
              onChange={handleChange}
            />
          </SFilterBoxGap10>
          <SFilterBoxGap10>
            <SSubTitle>
              최대 대여 기간<SImportantStar>*</SImportantStar>
            </SSubTitle>
            <SSelectProduct>
              <SelectButton
                itemList={day}
                activeIndex={maxDaySelect}
                onClickHandler={(index) => selectHandler("maxDaySelect", index)}
              ></SelectButton>
            </SSelectProduct>
            <SFilterInputDay
              name="maxRentalDay"
              type="text"
              placeholder="숫자만 입력하세요."
              value={maxRentalDay}
              onChange={handleChange}
            />
          </SFilterBoxGap10>
        </SFilterDoubleBox>
      </SFilterContainer>
      <SContent>
        <SContentBorder>
          <SSubTitle>
            내용<SImportantStar>*</SImportantStar>
          </SSubTitle>
          <SSellContentInput
            name="content"
            type="text"
            value={content}
            onChange={handleChange}
          />
        </SContentBorder>
      </SContent>
      <SSellFooter>
        <SFooterBtnMargin>
          <SBtnGoBack onClick={goBackBtn}>취소</SBtnGoBack>
        </SFooterBtnMargin>
        <SFooterBtnMargin>
          <SBtnWritePost onClick={goSellBtn}>등록</SBtnWritePost>
        </SFooterBtnMargin>
      </SSellFooter>
    </SMain>
  );
};
export default StoreUpdate;

const SMain = styled.div`
  margin-top: 170px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 170px;
`;

const SHeader = styled.div`
  display: flex;
  width: 800px;
  padding: 20px 0px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  border-bottom: 2px solid var(--title-underline, #a255f7);
`;

const STittleAndBtn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 180px;
`;

const STitle = styled.p`
  color: var(--black, #000);
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  line-height: normal;
`;

const SImportantText = styled.p`
  color: var(--necessary, #fb1818);
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-self: stretch;
`;

const SSellHeader = styled.div`
  display: flex;
  width: 800px;
  padding: 30px 20px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--content-underline, #e9d5ff);
  margin: 0px;
`;

const SSellHeaderPading = styled.div`
  display: flex;
  // align-items: flex-start;
  gap: 30px;
`;

const SSubTitle = styled.p`
  color: var(--black, #000);
  text-align: center;
  font-size: 20px;
  font-weight: 700;
`;

const SImportantStar = styled.span`
  width: 8px;
  height: 24px;
  color: var(--necessary, #fb1818);
  text-align: center;
  font-size: 16px;
  font-weight: 700;
`;

const SSellTitleInput = styled.input`
  color: #000;
  // text-align: center;
  font-size: 20px;
  font-weight: 700;
  width: 600px;
`;

const SFilterContainer = styled.div`
  display: flex;
  width: 800px;
  padding: 30px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid var(--content-underline, #e9d5ff);
`;

const SFilterDoubleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

const SFilterBoxGap35 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 35px;
`;

const SFilterBoxGap20 = styled.div`
  display: flex;
  width: 320px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
`;

const SFilterBoxGap10 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  width: 320px;
`;

const SSelectProduct = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const SSelectProductBtn = styled.button`
  display: flex;
  width: 74px;
  height: 26px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 115px;
  border: 1px solid ${(props) => (props.$activeProduct ? "#A255F7" : "#D9D9D9")};
  background: #fff;
  cursor: pointer;
  color: ${(props) => (props.$activeProduct ? "#A255F7" : "#D9D9D9")};
`;

const SFilterInputCost = styled.input`
  display: flex;
  width: 277px;
  padding: 16px;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  border: 1px solid var(--border, #d9d9d9);
  &::placeholder {
    color: #d9d9d9;
  }
`;

const SFilterInputDay = styled.input`
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 10px;
  border: 1px solid var(--border, #d9d9d9);
  &::placeholder {
    color: #d9d9d9;
  }
`;

const SFilterInFutAndWon = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
`;

const SPicture = styled.div`
  display: flex;
  width: 800px;
  padding: 30px 20px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--content-underline, #e9d5ff);
`;

const SLabel = styled.label`
  width: 138px;
  height: 101px;
  flex-shrink: 0;
`;

const SPictureList = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SInsertPicture = styled.img`
  height: 101px;
  border-radius: 10px;
`;

const SContent = styled.div`
  display: flex;
  width: 800px;
  padding: 30px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid var(--content-underline, #e9d5ff);
`;

const SContentBorder = styled.div`
  display: flex;
  gap: 50px;
  align-self: stretch;
`;

const SSellContentInput = styled.textarea`
  color: #000;
  // text-align: center;
  height: 400px;
  font-size: 20px;
  font-weight: 700;
  width: 600px;
  // overflow: hidden;
  resize: none;
`;

const SSellFooter = styled.div`
  display: flex;
  width: 800px;
  padding: 10px;
  justify-content: flex-end;
  align-items: center;
`;

const SFooterBtnMargin = styled.div`
  display: flex;
  padding: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const SBtnGoBack = styled.button`
  display: flex;
  height: 50px;
  padding: 20px 40px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 7px;
  background: #d9d9d9;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  color: #fff;
  text-align: center;
  text-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.14px;
`;

const SBtnWritePost = styled.div`
  display: flex;
  height: 50px;
  padding: 10px 40px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 7px;
  background: #e9d5ff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  color: #fff;
  text-align: center;
  text-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.14px;
`;
