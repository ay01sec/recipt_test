import { StyleSheet, Platform } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  defaultText: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
});

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  stepContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },

  Input_container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  Input_view: {
    marginTop: 8,
  },

  Input_input: {
    width: 240,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
  },

  buttonStyle: {
    backgroundColor: "#2525ff",
    width: 240,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    marginVertical: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  headerImage: {
    position: 'absolute',
    bottom: -90,
    left: -35,
    color: "#2525ff",
  },

  reactLogo: {
    height: 100,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  pickerContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'android' ? 0 : 12,
  },

  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30,
  },

  inputAndroid: {
    fontSize: 16,
    color: 'black',
    paddingRight: 30,
  },
});
