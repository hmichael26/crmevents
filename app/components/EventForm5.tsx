import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../hooks";
import { Datepicker } from "@ui-kitten/components";
import Button from "./Button";
import { AuthContext } from "../context/AuthContext";
import SelectOption from "./SelectOption";
import Icon from "react-native-vector-icons/Ionicons";

const { height } = Dimensions.get("window");
const FIELD_HEIGHT = 50;

interface DateFieldProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DateField: React.FC<DateFieldProps> = ({ date, onDateChange }) => {
  return (
    <View style={{ flex: 1 }}>
      <Datepicker
        placeholder="Sélectionner une date"
        style={{ width: "100%" }}
        min={new Date(2000, 0, 1)}
        max={new Date(2030, 11, 31)}
        controlStyle={{
          backgroundColor: "transparent",
          borderWidth: 0,
          paddingHorizontal: 0,
        }}
        size="medium"
        status="primary"
        backdropStyle={{ backgroundColor: "transparent", opacity: 0.3 }}
        date={date}
        onSelect={(nextDate) => onDateChange(nextDate)}
      />
    </View>
  );
};

interface FormData {
  fields: {
    type: FieldType;
    value: string;
  }[];
  timestamp: string;
}

interface Option {
  id: string;
  libelle: string;
}

type FieldType = "date" | "text" | "dynamic";

interface Field {
  type: FieldType;
  value: Date | string;
}

interface Form5Props {
  options: Option[];
  onDataChange: (data: any) => void;
  item?: any;
}

const Form5: React.FC<Form5Props> = ({ options, onDataChange, item }) => {
  const { userdata } = useContext(AuthContext);
  const { gradients, colors } = useTheme();

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();

    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return new Date(dateStr);
  };

  const determineFieldType = (fieldItem: any): FieldType => {
    if (
      fieldItem.type === "date" ||
      fieldItem.type === "text" ||
      fieldItem.type === "dynamic"
    ) {
      return fieldItem.type;
    }

    if (
      typeof fieldItem.value === "string" &&
      fieldItem.value.match(/^\d{2}\/\d{2}\/\d{4}$/)
    ) {
      return "date";
    }

    return "text";
  };

  const [fields, setFields] = useState<Field[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (item && Array.isArray(item) && item.length > 0) {
      const initializedFields = item.map((fieldItem: any) => {
        const fieldType = determineFieldType(fieldItem);
        return {
          type: fieldType,
          value:
            fieldType === "date"
              ? parseDate(fieldItem.value)
              : fieldItem.value || "",
        };
      });
      setFields(initializedFields);
    }
  }, [item]);

  useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setDynamicOptions(options);
    }
  }, [options]);

  useEffect(() => {
    const formData = {
      fields: fields.map((field) => ({
        type: field.type,
        value:
          field.type === "date"
            ? (field.value as Date).toLocaleDateString("fr-FR")
            : field.value,
      })),
    };
    onDataChange(formData);
  }, [fields]);

  const addRandomField = (option: number): void => {
    const fieldTypes: FieldType[] = ["date", "text", "dynamic"];
    const randomType = fieldTypes[option];
    let newField: Field;

    switch (randomType) {
      case "date":
        newField = { type: "date", value: new Date() };
        break;
      case "text":
        newField = { type: "text", value: "" };
        break;
      case "dynamic":
        if (dynamicOptions.length > 0) {
          newField = {
            type: "dynamic",
            value: dynamicOptions[0].libelle, // Utiliser le libelle maintenant
          };
        } else {
          newField = {
            type: "dynamic",
            value: "",
          };
        }
        break;
    }

    setFields([...fields, newField]);
  };

  const updateField = (index: number, newValue: Date | string): void => {
    const newFields = [...fields];
    newFields[index].value = newValue;
    setFields(newFields);
  };

  const removeField = (index: number): void => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const renderField = (field: Field, index: number) => {
    switch (field.type) {
      case "date":
        return (
          <View key={index} style={styles.fieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <DateField
              date={field.value as Date}
              onDateChange={(newDate) => updateField(index, newDate)}
            />
          </View>
        );
      case "text":
        return (
          <View key={index} style={styles.fieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={field.value as string}
              onChangeText={(newText: string) => updateField(index, newText)}
              placeholder="Entrer du texte"
              placeholderTextColor="#999"
            />
          </View>
        );
      case "dynamic":
        return (
          <View key={index} style={styles.dynamicFieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButtonDynamic}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <SelectOption
                options={dynamicOptions}
                selectedOption={field.value as string}
                onSelectionChange={(selectedLibelle) =>
                  updateField(index, selectedLibelle)
                }
                placeholder="Sélectionnez une option"
              />
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {(!item || item.length === 0 || fields.length === 0) && (
        <View style={styles.fieldContainer}>
          <Text style={[styles.loadingText, { color: colors.danger }]}>
            Aucun champ ajouté
          </Text>
        </View>
      )}

      {fields &&
        fields.map((field, index) => (
          <View key={index} style={styles.fieldContainer}>
            {renderField(field, index)}
          </View>
        ))}

      <View style={styles.buttonContainer}>
        <Button
          gradient={gradients.secondary}
          style={styles.button}
          onPress={() => addRandomField(0)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ DATE
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>

        <Button
          gradient={gradients.info}
          style={styles.button}
          onPress={() => addRandomField(1)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ TEXT
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>

        <Button
          gradient={gradients.success}
          style={styles.button}
          onPress={() => addRandomField(2)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ DYNAMIQUE
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 10,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 7,
    minHeight: FIELD_HEIGHT + 5,
    backgroundColor: "#fff",
  },
  dynamicFieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 7,
    minHeight: FIELD_HEIGHT + 5,
    backgroundColor: "#fff",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  removeButtonDynamic: {
    paddingRight: 10,
    alignSelf: "flex-start",
    paddingTop: 5,
  },
  removeText: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 28,
  },
  textInput: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 20,
  },
  buttonContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  centerText: {
    textAlign: "center",
    flex: 1,
  },
  plusIcon: {
    fontSize: 25,
    marginHorizontal: 5,
  },
});

export default Form5;
