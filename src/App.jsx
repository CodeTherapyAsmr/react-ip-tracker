import { useRef, useState } from "react";
import styled from "styled-components"
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

const API_KEY = 'at_GHIP7i4afYp7SRm0kxcvcgiuAcxdt';

const colors = {
  black: `hsl(0, 0%, 0%)`,
  darkGray: `hsl(0, 0%, 17%)`,
  gray: `hsl(0, 0%, 59%)`
}


const ArrowIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="14">
      <path
        fill="none"
        stroke="#FFF"
        strokeWidth="3"
        d="M2 1l6 6-6 6" />
    </svg>
  )
}

const Title = styled.h1`
  color: white;
  font-size: 24px;
  text-align:center;
  margin: 0;
  padding:12px 0 ;
`

const InputContainer = styled.div`
  display:flex ;
  justify-content:center ;
  align-items: flex-start;
  height:40px ;
`

const Input = styled.input`
  padding:12px ;
  border-radius:12px 0 0 12px;
  border: none;
  height: 100%;
  width:50% ;
  font-size:18px ;
`

const Button = styled.button`
  background-color: ${colors.black};
  height:100%;
  width:40px;
  border:none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  &:hover {
    background-color:${colors.darkGray};
  }
`

const ResultsContainer = styled.div`
  display:flex;
  justify-content:space-around ;
  align-items:center ;
  width: 80%;
  padding: 30px 20px;
  background-color: white;
  border-radius:12px ;
  margin:0 auto ;
  margin-top:40px ;
  position: relative;
  z-index:1 ;
`

const ResultItem = styled.div`
  position:relative ;
  display: flex;
  flex-direction:column ;
  align-items:center ;
  width:100% ;
  border-right: solid 1px ${colors.gray};
  &:last-child{
    border-right:none;
  }
  padding: 0 20px;
`

const ResultKey = styled.h2`
  font-size:12px ;
  color: ${colors.gray};
`

const ResultValue = styled.span`
  font-size:18px ;
  font-weight: 500;
`

const MapsContainer = styled.div`
  position: relative;
  background-color: lightyellow;
  width:100% ;
  height: 100%;
  min-height: 600px;
  z-index:0 ;
  transform:translateY(-60px);
`

const ErrorMessage = styled.p`
  color: red;
  font-size:16px;
  text-align:center ;
`

const MainContainer = styled.div`
  height: 100%;
  background-image: url('./images/pattern-bg-desktop.png');
  background-repeat: no-repeat;
  padding:30px 0;
  background-size:contain ;
  @media screen and (max-width:375px){
    background-image: url('./images/pattern-bg-mobile.png');
    ${MapsContainer} {
      transform:translateY(-200px);
    }
    ${ResultItem} {
      border-right: unset;
    }
    ${ResultsContainer} {
      flex-direction:column ;
      width: 90%;
    }
    ${Input} {
      width: 80%;
    }
  }
`

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function App() {
  const inputRef = useRef();
  const [error, setError] = useState("");
  const [ipInfo, setIpInfo] = useState({
    ip: '192.168.20.20',
    isp: 'SpaceX',
    location: {
      region: 'Brooklyn, NY 10001',
      timezone: 'UTC-05:00',
      lat: 51.505,
      lng: -0.09
    }
  })

  const handleInputChange = () => {
    const value = inputRef.current.value;
    inputRef.current.value = value.replace(/[^0-9.]/g, "");
  };

  const validateIpAddress = (ipAddress) => {
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipv4Regex.test(ipAddress)
  }

  const getLocation = async () => {
    setError("")
    const ipAddress = inputRef.current.value;
    if (!validateIpAddress(ipAddress)) {
      setError("You must enter a valid IP Address");
      return;
    }
    try {
      const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=${ipAddress}`;
      const response = await fetch(url);
      if (response.ok && response.status === 200) {
        const ipLocation = await response.json();
        setIpInfo({
          ip: ipLocation.ip,
          isp: ipLocation.isp,
          location: {
            region: ipLocation.location.city,
            timezone: `UTC${ipLocation.location.timezone}`,
            lat: ipLocation.location.lat,
            lng: ipLocation.location.lng,
          }
        })
      } else {
        const error = await response.json();
        throw new Error(error.messages)
      }
    } catch (e) {
      setError(e?.message);
      console.log(e)
    }
  }

  return (
    <MainContainer>
      <Title> IP Address Tracker </Title>
      <InputContainer>
        <Input value={`4.4.4.4`} ref={inputRef} onInput={handleInputChange} placeholder="Search for any IP address or domain" />
        <Button onClick={getLocation}>
          <ArrowIcon />
        </Button>
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ResultsContainer>
        <ResultItem>
          <ResultKey>IP Address</ResultKey>
          <ResultValue>{ipInfo.ip}</ResultValue>
        </ResultItem>

        <ResultItem>
          <ResultKey>Location</ResultKey>
          <ResultValue>{ipInfo.location.region}</ResultValue>
        </ResultItem>

        <ResultItem>
          <ResultKey>TimeZone</ResultKey>
          <ResultValue>{ipInfo.location.timezone}</ResultValue>
        </ResultItem>

        <ResultItem>
          <ResultKey>IPS</ResultKey>
          <ResultValue>{ipInfo.isp}</ResultValue>
        </ResultItem>
      </ResultsContainer>
      <MapsContainer>
        <MapContainer center={[ipInfo.location.lat, ipInfo.location.lng]} zoom={13} scrollWheelZoom={true}>
          <ChangeView center={[ipInfo.location.lat, ipInfo.location.lng]} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[ipInfo.location.lat, ipInfo.location.lng]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </MapsContainer>
    </MainContainer>
  )
}

export default App
