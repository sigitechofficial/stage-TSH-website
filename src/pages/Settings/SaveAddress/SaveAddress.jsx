import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, GoogleMap, MarkerF } from "@react-google-maps/api";
import { inputStyle } from "../../../utilities/Style";
import {
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import Select from "react-select";
import { MdOutlineCancel } from "react-icons/md";
import GetAPI from "../../../utilities/GetAPI";
import Loader from "../../../components/Loader";
import SaveAddressCard from "../../../components/SaveAddressCard";
import MiniLoader from "../../../components/MiniLoader";
import { PostAPI } from "../../../utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../../utilities/Toaster";
import { BASE_URL } from "../../../utilities/URL";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function SaveAddress() {
  const containerStyle = {
    width: "100%",
    height: "300px",
    marginBottom: "12px",
  };
  const options = [
    {
      value: "dropoff",
      label: "Dropoff Address",
    },
    {
      value: "pickup",
      label: "Pickup Address",
    },
  ];
  const [center, setCenter] = useState({ lat: 40.712776, lng: -74.005974 });
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressId, setAddressId] = useState("");
  const [addressType, setAddressType] = useState({
    value: "",
    label: "",
  });
  const [address, setAddress] = useState({
    title: "",
    streetAddress: "",
    building: "",
    floor: "",
    apartment: "",
    district: "",
    city: "",
    province: "",
    country: "",
    postalCode: "",
    lat: "",
    lng: "",
  });
  const [description, setDescription] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState(center);
  const autocompleteRef = useRef(null);
  const geocoder = useRef(null);

  const { data, reFetch } = GetAPI("customer/getattachaddresses");

  const onClose = () => {
    setModal(true);
  };

  const getAddressComponent = (components, types) => {
    const component = components.find((component) =>
      component.types.some((type) => types.includes(type))
    );
    return component ? component.long_name : null;
  };

  const calculateRoute = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.address_components) {
      return;
    }
    const components = place.address_components;
    const lat = place?.geometry?.location?.lat();
    const lng = place?.geometry?.location?.lng();
    setMarkerPosition({ lat, lng });

    setAddress({
      ...address,
      lat: lat,
      lng: lng,
      // postalCode: getAddressComponent(components, ["postal_code"]),
      country: getAddressComponent(components, ["country"]),
      province: getAddressComponent(components, [
        "administrative_area_level_1",
      ]),
      city: getAddressComponent(components, [
        "locality",
        "sublocality",
        "administrative_area_level_2",
      ]),
      district: getAddressComponent(components, [
        "sublocality_level_1",
        "neighborhood",
        "administrative_area_level_3",
      ]),
      streetAddress: `${
        getAddressComponent(components, ["street_number"])
          ? getAddressComponent(components, ["street_number"])
          : ""
      } ${
        getAddressComponent(components, ["route"])
          ? getAddressComponent(components, ["route"])
          : ""
      }`,
    });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const components = results[0].address_components;
        setFormattedAddress(results[0].formatted_address);
        setAddress({
          ...address,
          lat: lat,
          lng: lng,
          // postalCode: getAddressComponent(components, ["postal_code"]),
          country: getAddressComponent(components, ["country"]),
          province: getAddressComponent(components, [
            "administrative_area_level_1",
          ]),
          city: getAddressComponent(components, [
            "locality",
            "sublocality",
            "administrative_area_level_2",
          ]),
          district: getAddressComponent(components, [
            "sublocality_level_1",
            "neighborhood",
            "administrative_area_level_3",
          ]),
          streetAddress: `${
            getAddressComponent(components, ["street_number"])
              ? getAddressComponent(components, ["street_number"])
              : ""
          } ${
            getAddressComponent(components, ["route"])
              ? getAddressComponent(components, ["route"])
              : ""
          }`,
        });
      } else {
        setFormattedAddress("");
        setAddress({
          ...address,
          lat: lat,
          lng: lng,
          // postalCode: null,
          country: null,
          province: null,
          city: null,
          district: null,
          streetAddress: "",
        });
      }
    });
  };

  const handleDelete = (addressId) => {
    setModal(true);
    setAddressId(addressId);
  };

  const handleDeleteAddress = async () => {
    setLoading(true);
    const res = await PostAPI("customer/unattachaddress", {
      attchedAddressId: addressId,
    });
    if (res?.data?.status === "1") {
      setLoading(false);
      setModal(false);
      reFetch();
      success_toaster(res?.data?.message);
    } else {
      error_toaster(res?.data?.error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address?.lat === "" || address?.lng === "") {
      info_toaster("Select Address on Map");
    } else if (addressType?.value === "") {
      info_toaster("Select address type");
    } else if (address?.title === "") {
      info_toaster("Enter address title");
    } else if (address?.streetAddress === "") {
      info_toaster("Enter Street Address");
    } else if (address?.building === "") {
      info_toaster("Enter building no");
    } else if (address?.floor === "") {
      info_toaster("Enter Floor no");
    } else if (address?.apartment === "") {
      info_toaster("Enter apartment");
    } else if (address?.postalCode === "") {
      info_toaster("Enter Postal Code");
    } else if (description === "") {
      info_toaster("Enter description");
    } else if (address?.city === "") {
      info_toaster("City cannot be empty");
    } else {
      setLoading(true);
      const res = await PostAPI("customer/attachaddress", {
        type: addressType?.value,
        addressData: {
          title: address?.title,
          streetAddress: address?.streetAddress,
          building: address?.building,
          floor: address?.floor,
          apartment: address?.apartment,
          district: address?.district,
          city: address?.city,
          province: address?.province,
          country: address?.country,
          postalCode: address?.postalCode,
          lat: address?.lat,
          lng: address?.lng,
        },
      });
      if (res?.data?.status === "1") {
        setLoading(false);
        reFetch();
        setAddress({
          title: "",
          streetAddress: "",
          building: "",
          floor: "",
          apartment: "",
          district: "",
          city: "",
          province: "",
          country: "",
          postalCode: "",
          lat: "",
          lng: "",
        });
        setDescription("");
        success_toaster(res?.data?.message);
      } else {
        error_toaster(res?.data?.error);
        setLoading(false);
      }
    }
  };

  const handleAddressType = (val) => {
    if (val?.value === "pickup") {
      setCenter({ lat: 39.8283, lng: -98.5795 });
      setMarkerPosition({ lat: 39.8283, lng: -98.5795 });
    } else {
      setCenter({ lat: 18.200178, lng: -66.664513 });
      setMarkerPosition({ lat: 18.200178, lng: -66.664513 });
    }
    setAddressType(val);
  };

  useEffect(() => {
    if (!geocoder.current) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMarkerPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        console.error("Error retrieving location");
      }
    );
  }, []);

  return data.length === 0 ? (
    <Loader />
  ) : (
    <Layout
      button={true}
      buttonText="Back"
      buttonIcon={<IoMdArrowRoundBack size={"20px"} />}
      title="Add Address"
      rightSide={
        <div className="space-y-8">
          {loading ? (
            <MiniLoader />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-6 md:gap-x-8 lg:gap-x-10"
            >
              {/* left side */}
              <div className="space-y-5">
                <div>
                  <GoogleMap
                    zoom={12}
                    center={markerPosition}
                    mapContainerStyle={containerStyle}
                    onClick={handleMapClick}
                  >
                    <MarkerF position={markerPosition} />
                  </GoogleMap>
                </div>
                <div className="space-y-2">
                  {/* <button
                    onClick={calculateRoute}
                    className="w-full border border-theme text-white bg-theme rounded-md py-2.5 px-8 font-medium font-switzer"
                  >
                    Search
                  </button> */}
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      (autocompleteRef.current = autocomplete)
                    }
                    onPlaceChanged={() => {
                      const place = autocompleteRef.current.getPlace();
                      if (place) {
                        setFormattedAddress(
                          place.formatted_address || place.name
                        );
                        calculateRoute();
                      }
                    }}
                  >
                    <div className="relative">
                      <input
                        value={formattedAddress}
                        type="search"
                        className={inputStyle}
                        placeholder="Search address"
                        onChange={(e) => setFormattedAddress(e.target.value)}
                      />
                    </div>
                  </Autocomplete>
                </div>
              </div>

              {/* right side */}
              <div className="font-switzer space-y-4">
                <div className="space-y-1">
                  <label htmlFor="title">Select Address Type*</label>
                  <Select
                    onChange={(val) => handleAddressType(val)}
                    options={options}
                    placeholder="Select Address Type"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="title">Address Title*</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={address?.title}
                    onChange={handleChange}
                    className={`${inputStyle}`}
                    placeholder="e:g Home, Office"
                  />
                </div>
                <div className="space-y-1 ">
                  <label htmlFor="streetAddress">Street Name*</label>
                  <input
                    type="text"
                    name="streetAddress"
                    id="streetAddress"
                    value={address?.streetAddress}
                    onChange={handleChange}
                    className={`${inputStyle}`}
                    placeholder="Enter street name"
                  />
                </div>
                <div className="space-y-1 ">
                  <label htmlFor="building">Building*</label>
                  <input
                    type="text"
                    name="building"
                    id="building"
                    value={address?.building}
                    onChange={handleChange}
                    className={`${inputStyle}`}
                    placeholder="Main Blvd Johar town"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="floor">Floor*</label>
                    <input
                      type="text"
                      name="floor"
                      id="floor"
                      value={address?.floor}
                      onChange={handleChange}
                      className={`${inputStyle}`}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="apartment">Apt*</label>
                    <input
                      type="text"
                      name="apartment"
                      id="apartment"
                      onChange={handleChange}
                      className={`${inputStyle}`}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="postalCode">Postal Code*</label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      onChange={handleChange}
                      className={`${inputStyle}`}
                      placeholder="Postal code"
                    />
                  </div>
                </div>
                <div className="space-y-1 ">
                  <label htmlFor="">Description*</label>
                  <input
                    type="text"
                    name=""
                    id=""
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputStyle}`}
                    placeholder="e.g Nearest landmark"
                  />
                </div>
                <div>
                  <Checkbox defaultChecked>
                    Save this address for future use
                  </Checkbox>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5  font-medium bg-theme text-themeText rounded-md
              hover:text-theme hover:bg-transparent border hover:border-theme"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          {!loading && (
            <div className="space-y-4 md:space-y-6">
              <p className="font-switzer font-bold text-themePlaceholder text-2xl">
                Saved Address
              </p>
              {data?.data?.addressData.length === 0 ? (
                <div className="space-y-4 md:space-y-6">
                  <div className="text-crossColor flex justify-center items-center">
                    <MdOutlineCancel size={100} />
                  </div>
                  <p className="font-semibold font-switzer text-xl md:text-2xl lg:text-3xl text-center">
                    No Address Found
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                  {data?.data?.addressData?.map((address, i) => (
                    <SaveAddressCard
                      key={i}
                      address={address}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <Modal
            size={window.innerWidth < 768 ? "sm" : "md"}
            isOpen={modal}
            onClose={onClose}
            isCentered
            motionPreset="slideInBottom"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {!loading && (
                  <div className="!font-bold !text-xl !font-switzer pt-5">
                    Are you sure you want to delete this Address ?
                  </div>
                )}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {loading ? (
                  <MiniLoader />
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 pb-5">
                    <button
                      onClick={() => setModal(false)}
                      className="w-full py-2.5 font-switzer font-medium bg-transparent text-theme rounded-md
             hover:text-themeText hover:bg-theme border border-theme hover:border-theme"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAddress}
                      className="w-full py-2.5 font-switzer font-medium bg-theme text-themeText rounded-md
             hover:text-theme hover:bg-transparent border hover:border-theme"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </div>
      }
    />
  );
}
