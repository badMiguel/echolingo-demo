import { Pressable, SectionList, StyleSheet, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { DataType, Submission, emptyTiwiData, useTiwiListContext } from "@/contexts/TiwiContext";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import SearchBar from "@/components/search/search";
import { Switch } from "react-native-paper";
// import { useSubmissions } from "@/contexts/SubmissionsContext";
import { useCallback } from "react";

const useColor = () => {
    return {
        bgColor: useThemeColor({}, "background"),
        textColor: useThemeColor({}, "text"),
        primary: useThemeColor({}, "primary"),
        primary_tint: useThemeColor({}, "primary_tint"),
    };
};

function filterRecorded(data: DataType): { recorded: DataType[]; notRecorded: DataType[] } {
    let recorded: DataType[] = [];
    let notRecorded: DataType[] = [];

    // todo optimise
    const recordedKey = new Set(Object.keys(data).filter((key) => data[key]["recording"]));

    for (const key in data) {
        if (recordedKey.has(key)) {
            recorded.push({ [key]: data[key] });
        } else {
            notRecorded.push({ [key]: data[key] });
        }
    }

    return { recorded, notRecorded };
}

export default function RecordingList() {
    const [dataRecorded, setDataRecorded] = useState<DataType[]>([]);
    const [dataNotRecorded, setDataNotRecorded] = useState<DataType[]>([]);
    const [searchResults, setSearchResults] = useState<
        string[] | Map<string, string[]> | undefined
    >();
    const [showRecorded, setShowRecorded] = useState<boolean>(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const submissions: any = [];
    const isLoading = false;

    const data = useTiwiListContext();
    const color = useColor();

    const normalizeString = (str: string) => {
        if (!str) {
            // console.log("fixed")
            return "";
        }
        return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    };

    // const getSubmissionCount = useCallback(
    //     (sentenceEnglish: string | undefined) => {
    //         if (!sentenceEnglish) {
    //             console.error("getSubmissionCount: sentenceEnglish is undefined");
    //             return 0;
    //         }
    //         const normalizedSentence = normalizeString(sentenceEnglish);
    //         const count = submissions.filter((sub) => {
    //             const normalizedSubmission = normalizeString(sub.sentenceEnglish);
    //             return normalizedSubmission.includes(normalizedSentence);
    //         }).length;
    //         // console.log(`getSubmissionCount for "${sentenceEnglish}":`, count);
    //         return count;
    //     },
    //     [submissions]
    // );

    const handleSearchResults = (searchList: string[] | Map<string, string[]>) => {
        setSearchResults(searchList);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // await refreshSubmissions();
        setIsRefreshing(false);
    };

    useEffect(() => {
        // todo error handling and optimisation
        if (data) {
            const { recorded, notRecorded } = filterRecorded(data);

            setDataRecorded(recorded);
            setDataNotRecorded(notRecorded);
        }
    }, [data]);

    useEffect(() => {
        // todo better error handling and optimisation
        if (!data) {
            console.error("Error Loading Data");
        } else if (searchResults) {
            const newItems: DataType = {};

            if (Array.isArray(searchResults)) {
                for (const i of searchResults) {
                    newItems[i] = data[i];
                }
            } else {
                for (const i of searchResults) {
                    for (const j of i[1]) {
                        newItems[j] = data[j];
                    }
                }
            }

            const { recorded, notRecorded } = filterRecorded(newItems);

            setDataRecorded(recorded);
            setDataNotRecorded(notRecorded);
        } else if (data) {
            const { recorded, notRecorded } = filterRecorded(data);

            setDataRecorded(recorded);
            setDataNotRecorded(notRecorded);
        }
    }, [data, searchResults]);

    const sections = [
        {
            title: showRecorded ? "With Recording" : "Without Recording",
            data: showRecorded
                ? dataRecorded.length > 0
                    ? dataRecorded
                    : [{ "0": emptyTiwiData() }]
                : dataNotRecorded.length > 0
                    ? dataNotRecorded
                    : [{ "0": emptyTiwiData() }],
        },
    ];

    if (isLoading) {
        return (
            <View style={[styles.loading_container, { backgroundColor: color.bgColor }]}>
                <ActivityIndicator size="large" color={color.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: color.bgColor }}>
            <SearchBar searchResults={handleSearchResults} />
            <SectionList
                sections={sections}
                keyExtractor={(item) => Object.keys(item)[0]}
                renderItem={({ item }) => {
                    const id = Object.keys(item)[0];
                    const sentenceData = item[id];
                    // console.log("Rendering item:", id, sentenceData);

                    if (id === "0") {
                        return sentenceData.completed ? (
                            <ThemedText>All sentences have been recorded</ThemedText>
                        ) : (
                            <ThemedText style={{ marginBottom: 30 }}>
                                No sentences recorded yet
                            </ThemedText>
                        );
                    }

                    // const submissionCount = getSubmissionCount(sentenceData.English);
                    // console.log(`Submission count for "${sentenceData.English}":`, submissionCount);

                    return (
                        <SentenceCard
                            sentence={item}
                            finished={false}
                            submissionCount={0}
                        />
                    );
                }}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionlist__header}>
                        <ThemedText type="subtitle">{title}</ThemedText>
                        <Switch
                            onValueChange={() => setShowRecorded(!showRecorded)}
                            value={showRecorded}
                        />
                    </View>
                )}
                style={styles.sectionlist}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
            />
        </View>
    );
}

const SentenceCard: React.FC<{
    sentence: DataType;
    finished: boolean;
    submissionCount: number;
}> = ({ sentence, submissionCount }) => {
    const id: string = Object.keys(sentence)[0];
    // const sentenceData = sentence[id];
    // console.log("SentenceCard rendering:", id, sentenceData, submissionCount);
    // console.log("SentenceCard received sentence data:", JSON.stringify(sentence, null, 2));
    // console.log("Extracted ID:", id);

    const color = useColor();

    const goToSentence = () => {
        // console.log("Navigating to sentence with ID:", id);
        router.push({
            pathname: sentence[id].recording ? "/viewRecording" : "/(addSentence)",
            params: {
                sentenceID: id,
            },
        });
    };

    const goToSubmissions = () => {
        console.log("Navigating to submissions with sentenceID:", id);
        router.push({
            pathname: "/submissions",
            params: {
                sentenceID: id,
                sentenceEnglish: sentence[id].English,
            },
        });
    };

    return (
        <View style={[styles.sentenceCard__container, { backgroundColor: color.primary_tint }]}>
            <ThemedText type="defaultSemiBold">
                {sentence[id].Tiwi ? "Tiwi: " : "Tiwi Gloss: "}
            </ThemedText>
            <ThemedText>{sentence[id].Tiwi}</ThemedText>
            <ThemedText type="defaultSemiBold">
                {sentence[id].English ? "English: " : "English Gloss: "}
            </ThemedText>
            <ThemedText>{sentence[id].English}</ThemedText>

            <Pressable
                style={[styles.button__container, { backgroundColor: color.primary }]}
                onPress={() => goToSentence()}
            >
                <ThemedText type="defaultSemiBold" style={{ color: color.bgColor }}>
                    {sentence[id].recording ? "View" : "Update"}
                </ThemedText>
            </Pressable>

            <Pressable
                style={[
                    styles.button__container,
                    { backgroundColor: submissionCount > 0 ? color.primary : "#ddd" },
                ]}
                onPress={goToSubmissions}
                disabled={submissionCount === 0}
            >
                <ThemedText
                    type="defaultSemiBold"
                    style={{ color: submissionCount > 0 ? color.bgColor : "#aaa" }}
                >
                    Submissions ({submissionCount})
                </ThemedText>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionlist: {
        paddingLeft: 30,
        paddingRight: 30,
    },

    sectionlist__header: {
        marginTop: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    sentenceCard__container: {
        marginBottom: 10,
        marginTop: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 10,
        gap: 10,
    },

    button__container: {
        marginTop: 5,
        paddingTop: 7,
        paddingBottom: 5,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 10,
        alignSelf: "center",
    },
    loading_container: {
        flex: 1,
        justifyContent: "center",
    },
});
