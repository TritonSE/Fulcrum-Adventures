import HomeScreen from "./src/app/(tabs)/home";
//import { SeeAll } from "./src/components/SeeAll";
// === test new ===
// === end test ===
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

export default function App() {
  return (
    <>
      {/* <HomePopUpPageHeaderSection sectionName="Popular" rightPadding={202} />
      <HomePopUpPageHeaderSection sectionName="Recommended" rightPadding={91} /> */}
      <HomeScreen />
    </>
  );
}
